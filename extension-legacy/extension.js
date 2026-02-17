const { GObject, St, Clutter, Gio, GLib, Pango } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const STATUS_FILE = GLib.get_home_dir() + '/.cache/research-watcher/status.json';

let ResearchWatcherIndicator = GObject.registerClass(
class ResearchWatcherIndicator extends PanelMenu.Button {
    _init() {
        super._init(0, "Research Watcher");

        // Container for icon and badge
        this._container = new St.BoxLayout();
        
        this._icon = new St.Icon({
            icon_name: 'input-dialpad-symbolic',
            style_class: 'system-status-icon'
        });
        
        this._badge = new St.Label({
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'research-watcher-badge'
        });
        this._badge.hide();

        this._container.add_child(this._icon);
        this._container.add_child(this._badge);
        this.add_child(this._container);
        
        this._updateMenu();
        
        // Monitor file for changes
        this._monitor = Gio.File.new_for_path(STATUS_FILE).monitor_file(Gio.FileMonitorFlags.NONE, null);
        this._monitor.connect('changed', () => {
            this._updateMenu();
        });

        // Clear badge when menu is opened
        this.menu.connect('open-state-changed', (menu, open) => {
            if (open) {
                this._badge.hide();
            }
        });
    }

    _updateMenu() {
        this.menu.removeAll();

        try {
            let file = Gio.File.new_for_path(STATUS_FILE);
            if (!file.query_exists(null)) {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem("No data found. Run backend/main.py"));
                return;
            }

            let [success, contents] = file.load_contents(null);
            if (!success) {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem("Failed to load status.json"));
                return;
            }

            let dataString = imports.byteArray.toString(contents);
            let data = JSON.parse(dataString);
            
            // Update Badge
            if (data.papers && data.papers.length > 0) {
                this._badge.text = data.papers.length.toString();
                this._badge.show();
            } else {
                this._badge.hide();
            }

            // Status Header
            let header = new PopupMenu.PopupMenuItem(data.message || "Research Watcher");
            header.setSensitive(false);
            header.label.add_style_class_name('research-watcher-header');
            this.menu.addMenuItem(header);
            
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            if (data.papers && data.papers.length > 0) {
                data.papers.forEach(paper => {
                    let subMenu = new PopupMenu.PopupSubMenuMenuItem(paper.title);
                    
                    let summaryItem = new PopupMenu.PopupMenuItem(paper.summary);
                    summaryItem.label.clutter_text.line_wrap = true;
                    summaryItem.label.clutter_text.line_wrap_mode = 2; // Pango.WrapMode.WORD
                    summaryItem.label.clutter_text.ellipsize = 0;   // Pango.EllipsizeMode.NONE
                    summaryItem.label.add_style_class_name('research-watcher-summary');
                    summaryItem.setSensitive(false);
                    subMenu.menu.addMenuItem(summaryItem);
                    
                    subMenu.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
                    
                    let linkItem = new PopupMenu.PopupMenuItem("Open Paper");
                    linkItem.connect('activate', () => {
                        Gio.app_info_launch_default_for_uri(paper.url, null);
                    });
                    subMenu.menu.addMenuItem(linkItem);
                    
                    this.menu.addMenuItem(subMenu);
                });
            } else {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem("No new papers."));
            }

            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            
            let lastUpdate = new PopupMenu.PopupMenuItem(`Updated: ${data.last_updated}`);
            lastUpdate.setSensitive(false);
            this.menu.addMenuItem(lastUpdate);

        } catch (e) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem("Error parsing data"));
            log("ResearchWatcher Error: " + e.message);
        }
    }
    
    destroy() {
        if (this._monitor) {
            this._monitor.cancel();
        }
        super.destroy();
    }
});

let indicator = null;

function init() {
}

function enable() {
    indicator = new ResearchWatcherIndicator();
    Main.panel.addToStatusArea('research-watcher-indicator', indicator);
}

function disable() {
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}
