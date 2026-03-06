// Регистрируем Handlebars хелперы для циклов и сравнений
Handlebars.registerHelper('times', function(n, block) {
  let accum = '';
  for (let i = 0; i < n; ++i) {
    block.data.index = i;
    block.data.first = i === 0;
    block.data.last = i === (n - 1);
    accum += block.fn(i);
  }
  return accum;
});

Handlebars.registerHelper('gte', function(a, b) {
  return a >= b;
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Основной хук инициализации
Hooks.once('init', function() {
  if (game.system.id !== 'simple-worldbuilding') {
    console.warn('Black Hood Sheet рекомендуется использовать с системой Simple Worldbuilding.');
    return;
  }

  const systemData = game.system.model.Actor;
  if (!systemData.types.includes('blackHood')) {
    systemData.types.push('blackHood');
  }

  class BlackHoodActor extends Actor {
    prepareData() {
      super.prepareData();
      const system = this.system;
      
      if (!system.stats) system.stats = {
        Steady: 2, Firec: 1, Wily: 0, Sly: 1, Arcane: -1
      };
      if (!system.highlights) system.highlights = {
        Steady: false, Firec: false, Wily: false, Sly: false, Arcane: false
      };
      if (!system.honor) system.honor = { value: 1 };
      if (!system.hp) system.hp = { value: 5, max: 5 };
      if (!system.xp) system.xp = { value: 0, max: 5 };
      if (!system.gear) system.gear = '';
      if (!system.biography) system.biography = '';
      if (!system.notes) system.notes = '';
    }
  }

  class BlackHoodSheet extends ActorSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['black-hood', 'sheet', 'actor'],
        template: 'modules/black-hood-sheet/templates/black-hood-sheet.html',
        width: 700,
        height: 900,
        tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }]
      });
    }

    getData() {
      return super.getData();
    }

    activateListeners(html) {
      super.activateListeners(html);

      html.find('.stat-value').click(this._onStatRoll.bind(this));
      html.find('.highlight-toggle').click(this._onToggleHighlight.bind(this));
      html.find('.honor-plus').click(this._onModifyHonor.bind(this, 1));
      html.find('.honor-minus').click(this._onModifyHonor.bind(this, -1));
      html.find('.hp-plus').click(this._onModifyHP.bind(this, 1));
      html.find('.hp-minus').click(this._onModifyHP.bind(this, -1));
      html.find('.xp-plus').click(this._onModifyXP.bind(this, 1));
      html.find('.xp-minus').click(this._onModifyXP.bind(this, -1));
    }

    _onStatRoll(event) {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const value = this.actor.system.stats[stat];
      const formula = `2d6 + ${value}`;
      new Roll(formula).roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Бросок ${stat}`
      });
    }

    _onToggleHighlight(event) {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const current = this.actor.system.highlights[stat];
      this.actor.update({ [`system.highlights.${stat}`]: !current });
    }

    _onModifyHonor(delta, event) {
      event.preventDefault();
      const newVal = this.actor.system.honor.value + delta;
      if (newVal >= 0) {
        this.actor.update({ 'system.honor.value': newVal });
      }
    }

    _onModifyHP(delta, event) {
      event.preventDefault();
      const current = this.actor.system.hp.value;
      const max = this.actor.system.hp.max;
      const newVal = Math.clamped(current + delta, 0, max);
      this.actor.update({ 'system.hp.value': newVal });
    }

    _onModifyXP(delta, event) {
      event.preventDefault();
      const current = this.actor.system.xp.value;
      const max = this.actor.system.xp.max;
      const newVal = Math.clamped(current + delta, 0, max);
      this.actor.update({ 'system.xp.value': newVal });
    }
  }

  Actors.registerSheet('simple-worldbuilding', BlackHoodSheet, {
    types: ['blackHood'],
    makeDefault: true
  });
});