const Store = {
  KEY: 'kidlearn:v1',
  load() {
    try { const d = JSON.parse(localStorage.getItem(this.KEY)); if (d && d.profiles) { d.settings = d.settings || { voice: '', tone: 'cute' }; return d; } } catch (e) {}
    return { profiles: [], active: null, settings: { voice: '', tone: 'cute' } };
  },
  save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {} }
};
