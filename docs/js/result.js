const resultView = {
  currentResult: null,

  show(result) {
    this.currentResult = result;
    document.getElementById('result-score').textContent = result.score;
    document.getElementById('result-total').textContent = result.total;
    document.getElementById('result-percentage').textContent = `${result.percentage}%`;
    document.getElementById('result-time').textContent = Utils.formatTime(result.time);
    document.getElementById('result-accuracy').textContent = `${result.percentage}%`;
    document.getElementById('result-points').textContent = `${result.points} pts`;
    document.getElementById('result-attempted').textContent = result.attempted || 0;
    document.getElementById('result-wrong').textContent = result.wrong || 0;

    const grade = Utils.getGrade(result.percentage);
    document.getElementById('result-message').textContent = `${grade.emoji} ${grade.text}`;
    document.getElementById('result-quote').textContent = result.quote || '';

    document.getElementById('review-section').classList.add('hidden');
    document.getElementById('review-section').innerHTML = '';
  },

  reviewAnswers() {
    if (!this.currentResult || !quiz.data) return;
    const section = document.getElementById('review-section');
    section.classList.remove('hidden');
    section.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'review-header';
    header.innerHTML = `
      <h3 class="review-title">Answer Review</h3>
      <button class="btn btn-secondary btn-sm" onclick="document.getElementById('review-section').classList.add('hidden')">Close</button>
    `;
    section.appendChild(header);

    quiz.data.questions.forEach((q, idx) => {
      const userAnswer = quiz.answers[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      const isUnanswered = userAnswer === null;

      const item = document.createElement('div');
      item.className = `review-item ${isCorrect ? 'correct' : isUnanswered ? 'unanswered' : 'wrong'}`;

      let optionsHtml = '';
      q.options.forEach((opt, optIdx) => {
        let cls = 'review-option';
        if (optIdx === q.correctAnswer) cls += ' correct';
        else if (optIdx === userAnswer && !isCorrect) cls += ' wrong';
        else if (optIdx === userAnswer && isCorrect) cls += ' correct';

        optionsHtml += `<div class="${cls}">${Utils.escapeHtml(opt)}</div>`;
      });

      item.innerHTML = `
        <div class="review-question">${idx + 1}. ${Utils.escapeHtml(q.question)}</div>
        <div class="review-options">${optionsHtml}</div>
        ${q.explanation ? `<div class="review-explanation"><strong>Explanation:</strong> ${Utils.escapeHtml(q.explanation)}</div>` : ''}
        ${q.studyPoint ? `<div class="review-study"><strong>Study Point:</strong>${Utils.escapeHtml(q.studyPoint)}</div>` : ''}
      `;

      section.appendChild(item);
    });
  }
};
