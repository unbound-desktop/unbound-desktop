import { connectComponent } from '@api/settings';
import { Plug } from '@core/components/Icons';
import { Flex } from '@components/discord';
import * as Toasts from '@api/toasts';
import Manager from './Manager';

class Themes extends Manager {
  constructor(props) {
    super(props, 'themes');

    this.state = {
      search: '',
      breadcrumbs: [],
      settings: {
        entity: null,
        client: null
      }
    };
  }

  componentWillMount() {
    const forceUpdate = this.forceUpdate.bind(this, null);

    window.powercord && powercord.styleManager.on('updated', forceUpdate);
    window.BdApi && BdApi.Themes.on('updated', forceUpdate);
    window.unbound && unbound.managers.themes.on('updated', forceUpdate);
  }

  componentWillUnmount() {
    const forceUpdate = this.forceUpdate.bind(this, null);

    window.powercord && powercord.styleManager.off('updated', forceUpdate);
    window.BdApi && BdApi.Themes.off('updated', forceUpdate);
    window.unbound && unbound.managers.themes.off('updated', forceUpdate);
  }

  override getAddons() {
    const addons = {
      unbound: [...unbound.managers.themes.entities.values()],
      powercord: [],
      bd: []
    };

    if (window.powercord) {
      addons.powercord.push(...powercord.styleManager.addons);
    }

    if (window.BdApi) {
      addons.bd.push(...BdApi.Themes.getAll());
    }

    return { addons, count: Object.values(addons).flat().length };
  }

  override onReload() {
    const missing = {
      unbound: [],
      powercord: []
    };

    if (window.unbound) {
      const payload = unbound.managers.themes.loadMissing();
      missing.unbound.push(...payload.loaded);
    }

    if (window.powercord) {
      const payload = powercord.styleManager.loadAll(true, false);
      missing.powercord.push(...payload);
    }

    const res = Object.entries(missing).map(([client, addons]) => {
      if (!addons.length) return;
      const content = [];

      for (const addon of addons) {
        const name = this.resolve(addon, 'name');

        content.push(<Flex
          direction={Flex.Direction.HORIZONTAL}
          align={Flex.Align.CENTER}
          wrap={Flex.Wrap.NO_WRAP}
        >
          {client === 'powercord' ? <Plug
            width={12}
            height={12}
          /> : null} {name}
        </Flex>);
      }

      return content;
    }).filter(Boolean) as any as JSX.Element;

    if (!(res as any as []).length) return;

    Toasts.open({
      title: 'Missing themes found:',
      icon: 'CheckmarkCircle',
      color: 'var(--info-positive-foreground)',
      content: () => res
    });
  }
}

export default connectComponent(Themes, 'themes-manager');