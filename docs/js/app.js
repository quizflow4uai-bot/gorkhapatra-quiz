const app = {
  currentData: null,

  init() {
    home.loadLatest();
    home.loadCategories();
    home.loadQuizzesByDate();
    home.loadHistory();

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('quizflow_theme', isDark ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('quizflow_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const toggle = document.getElementById('sidebar-toggle');
      if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });

    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('open');
        if (profileDropdown.classList.contains('open')) {
          this.updateProfileStats();
        }
      });

      document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
          profileDropdown.classList.remove('open');
        }
      });
    }
  },

  showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(n => n.classList.remove('active'));

    const viewMap = {
      home: 'view-home',
      quiz: 'view-quiz',
      result: 'view-result',
      categories: 'view-categories',
      bookmarks: 'view-bookmarks',
      history: 'view-history',
      about: 'view-about'
    };
    const target = document.getElementById(viewMap[viewId] || 'view-home');
    if (target) target.classList.add('active');

    document.querySelectorAll(`.sidebar-link[data-target="${viewId}"]`).forEach(n => n.classList.add('active'));

    if (viewId === 'categories') {
      home.loadCategories();
    }
    if (viewId === 'history') {
      home.loadHistory();
    }
    if (viewId === 'bookmarks') {
      home.loadBookmarks();
    }
  },

  goHome() {
    this.showView('home');
    document.getElementById('sidebar').classList.remove('open');
  },

  goCategories() {
    this.showView('categories');
    document.getElementById('sidebar').classList.remove('open');
  },

  goBookmarks() {
    this.showView('bookmarks');
    document.getElementById('sidebar').classList.remove('open');
  },

  goHistory() {
    this.showView('history');
    document.getElementById('sidebar').classList.remove('open');
  },

  goAbout() {
    this.showView('about');
    document.getElementById('sidebar').classList.remove('open');
  },

  startLatestQuiz() {
    fetch('data/latest.json')
      .then(r => r.json())
      .then(data => this.startQuiz(data))
      .catch(() => alert('Failed to load quiz data.'));
  },

  startQuizFromArchive(filePath) {
    fetch(filePath)
      .then(r => r.json())
      .then(data => this.startQuiz(data))
      .catch(() => alert('Failed to load quiz data.'));
  },

  startQuiz(data) {
    this.currentData = data;
    this.showView('quiz');
    quiz.start(data);
  },

  async startCategoryQuiz(category) {
    try {
      const indexRes = await fetch('data/archive_index.json');
      if (!indexRes.ok) throw new Error('No archive index');
      const indexData = await indexRes.json();
      const archives = indexData.archives || [];

      const allQuestions = [];

      const quizPromises = archives.map(async (archive) => {
        try {
          const qRes = await fetch(archive.filePath);
          if (!qRes.ok) return [];
          const qData = await qRes.json();
          return qData.questions || [];
        } catch {
          return [];
        }
      });

      const questionArrays = await Promise.all(quizPromises);
      questionArrays.forEach(qs => allQuestions.push(...qs));

      const filtered = {
        metadata: { title: `${category} Quiz` },
        questions: allQuestions.filter(q => (q.category || 'General') === category)
      };

      if (filtered.questions.length === 0) {
        alert('No questions in this category.');
        return;
      }

      this.startQuiz(filtered);
    } catch {
      alert('Failed to load quiz data.');
    }
  },

  updateProfileStats() {
    const results = Storage.getResults();
    const bookmarks = Storage.getBookmarks();
    const stats = Storage.getStats();
    
    document.getElementById('profile-quizzes').textContent = results.length;
    document.getElementById('profile-bookmarks').textContent = bookmarks.length;
    document.getElementById('profile-best').textContent = stats ? `${stats.bestScore}%` : '0%';
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
