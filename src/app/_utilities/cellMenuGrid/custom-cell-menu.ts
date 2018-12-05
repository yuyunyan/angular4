import { ICellMenuParams } from "./icell-menu-params";
import { ICellMenuItem } from "./icell-menu-item";
export class CustomCellMenu {

    private menuContainer: HTMLElement;
    private evtClickOutside: EventListenerOrEventListenerObject;
    private menuItems: ICellMenuItem[];

    constructor() {
        this.evtClickOutside = (evt: MouseEvent) => {
            if (evt.target !== this.menuContainer && !this.isChild(this.menuContainer, evt.target)) {
                this.hide();
            }
        }
    }

    public createAndShow(params: ICellMenuParams, event: MouseEvent) {
        this.menuContainer = document.createElement('div');
        this.menuContainer.className = 'context-menu';
        document.body.appendChild(this.menuContainer);

        this.menuItems = params.menuItemsCallback(params, params._self);
        this.menuItems.forEach(rs => {
            let item = document.createElement('a');
            item.className = !rs.action ? 'disabled' : '';
            this.setLabelAndIcon(item, rs);
            item.addEventListener('click', () => {
                if (rs.action) {
                    rs.action(params._self, params, (newMenuItem) => {
                        this.setLabelAndIcon(item, newMenuItem);
                    });
                }
            });
            this.menuContainer.appendChild(item);
        });

        this.show(event);
    }

    private setLabelAndIcon(menuElement: HTMLElement, menuItem: ICellMenuItem) {
        menuElement.innerHTML = (menuItem.icon ? '<i class="' + menuItem.icon + '"></i>' : '') + menuItem.name;
    }

    private show(event: MouseEvent) {
        this.menuContainer.style.display = 'inline-block';
        this.menuContainer.style.top = event.pageY + 'px';
        this.menuContainer.style.left = event.pageX + 'px';
        document.addEventListener('mouseup', this.evtClickOutside);
    }

    private hide() {
        document.body.removeChild(this.menuContainer);
        document.removeEventListener('mouseup', this.evtClickOutside);
    }

    private isChild(parent, posibleChild) {
        if (parent.hasChildNodes()) {
            for (let i = 0; i < parent.childNodes.length; i++) {
                if (parent.childNodes.item(i) == posibleChild || this.isChild(parent.childNodes.item(i), posibleChild)) {
                    return true;
                }
            }
        }

        return false;
    }
}