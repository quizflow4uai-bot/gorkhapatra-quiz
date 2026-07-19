const Storage = {
  KEY_RESULTS: 'loksewa_quiz_results',
  KEY_BOOKMARKS: 'loksewa_quiz_bookmarks',

  getResults() {
    try {
      const data = localStorage.getItem(this.KEY_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveResult(result) {
    const results = this.getResults();
    results.unshift(result);
    if (results.length > 50) results.pop();
    localStorage.setItem(this.KEY_RESULTS, JSON.stringify(results));
  },

  clearResults() {
    localStorage.removeItem(this.KEY_RESULTS);
  },

  getStats() {
    const results = this.getResults();
    if (results.length === 0) return null;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
    return {
      attempts: results.length,
      avgScore: Math.round((totalScore / totalQuestions) * 100),
      bestScore: Math.max(...results.map(r => Math.round((r.score / r.total) * 100)))
    };
  },

  getBookmarks() {
    try {
      const data = localStorage.getItem(this.KEY_BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(question) {
    const bookmarks = this.getBookmarks();
    const idx = bookmarks.findIndex(b => b.question === question.question);
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
    } else {
      bookmarks.push({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        studyPoint: question.studyPoint,
        category: question.category,
        difficulty: question.difficulty
      });
    }
    localStorage.setItem(this.KEY_BOOKMARKS, JSON.stringify(bookmarks));
    return bookmarks;
  },

  isBookmarked(questionText) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.question === questionText);
  }
};
