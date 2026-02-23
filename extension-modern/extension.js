import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const STATUS_FILE = GLib.get_home_dir() + '/.cache/research-scout/status.json';

const ResearchScoutIndicator = GObject.registerClass(
    { GTypeName: 'ResearchScoutIndicator' },
    class ResearchScoutIndicator extends PanelMenu.Button {
        _init() {
            super._init(0, "ResearchScout");

            // Container for icon and badge
            this._container = new St.BoxLayout();
            
            this._icon = new St.Icon({
                icon_name: 'input-dialpad-symbolic',
                style_class: 'system-status-icon'
            });
            
            this._badge = new St.Label({
                text: '',
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'research-scout-badge'
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

                let dataString = new TextDecoder().decode(contents);
                let data = JSON.parse(dataString);
                
                // Update Badge
                if (data.papers && data.papers.length > 0) {
                    this._badge.text = data.papers.length.toString();
                    this._badge.show();
                } else {
                    this._badge.hide();
                }

                // Status Header
                let header = new PopupMenu.PopupMenuItem(data.message || "ResearchScout");
                header.setSensitive(false);
                header.label.add_style_class_name('research-scout-header');
                this.menu.addMenuItem(header);
                
                this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

                if (data.papers && data.papers.length > 0) {
                    data.papers.forEach(paper => {
                        let subMenu = new PopupMenu.PopupSubMenuMenuItem(paper.title);
                        
                        let summaryItem = new PopupMenu.PopupMenuItem(paper.summary);
                        summaryItem.label.clutter_text.line_wrap = true;
                        summaryItem.label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD;
                        summaryItem.label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
                        summaryItem.label.add_style_class_name('research-scout-summary');
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
                console.error("ResearchScout Error: " + e.message);
            }
        }
        
        destroy() {
            if (this._monitor) {
                this._monitor.cancel();
            }
            super.destroy();
        }
    }
);

export default class ResearchScoutExtension extends Extension {
    enable() {
        this._indicator = new ResearchScoutIndicator();
        Main.panel.addToStatusArea('research-scout-indicator', this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
