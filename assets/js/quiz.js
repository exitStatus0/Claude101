/**
 * Claude Code 101 — Quiz Engine
 * Renders quizzes from JSON data, grades inline, shows explanations.
 */
(function () {
  'use strict';

  var container = document.getElementById('quiz-container');
  if (!container) return;

  var quiz, strings;
  try {
    quiz = JSON.parse(container.dataset.quiz.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    strings = JSON.parse(container.dataset.strings.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  } catch (e) {
    container.innerHTML = '<p>Error loading quiz data.</p>';
    return;
  }

  var questions = quiz.questions || [];
  if (questions.length === 0) {
    container.innerHTML = '<p>' + (strings.no_questions || 'No questions available.') + '</p>';
    return;
  }

  var totalPoints = 0;
  questions.forEach(function (q) { totalPoints += (q.points || 1); });

  // Render
  var html = '<form id="quiz-form" class="quiz-form">';
  html += '<p class="quiz-meta">' + questions.length + ' ' + (strings.questions_label || 'questions') + ' &middot; ' + totalPoints + ' ' + (strings.points_label || 'points') + '</p>';

  questions.forEach(function (q, i) {
    html += '<div class="quiz-question" data-index="' + i + '" data-type="' + q.type + '">';
    html += '<div class="quiz-question-header">';
    html += '<span class="quiz-q-number">' + (strings.question_prefix || 'Q') + (i + 1) + '</span>';
    html += '<span class="quiz-q-points">' + (q.points || 1) + ' ' + (strings.pts || 'pt' + ((q.points || 1) > 1 ? 's' : '')) + '</span>';
    html += '</div>';
    html += '<p class="quiz-q-prompt">' + escapeHtml(q.prompt) + '</p>';

    if (q.type === 'single_choice' || q.type === 'true_false') {
      (q.options || []).forEach(function (opt, j) {
        var id = 'q' + i + '_o' + j;
        html += '<label class="quiz-option" for="' + id + '">';
        html += '<input type="radio" name="q' + i + '" id="' + id + '" value="' + j + '"> ';
        html += '<span>' + escapeHtml(opt) + '</span>';
        html += '</label>';
      });
    } else if (q.type === 'multi_select') {
      (q.options || []).forEach(function (opt, j) {
        var id = 'q' + i + '_o' + j;
        html += '<label class="quiz-option" for="' + id + '">';
        html += '<input type="checkbox" name="q' + i + '" id="' + id + '" value="' + j + '"> ';
        html += '<span>' + escapeHtml(opt) + '</span>';
        html += '</label>';
      });
    } else if (q.type === 'short_answer' || q.type === 'scenario_best_action') {
      if (q.options && q.options.length > 0) {
        // scenario with options
        (q.options || []).forEach(function (opt, j) {
          var id = 'q' + i + '_o' + j;
          html += '<label class="quiz-option" for="' + id + '">';
          html += '<input type="radio" name="q' + i + '" id="' + id + '" value="' + j + '"> ';
          html += '<span>' + escapeHtml(opt) + '</span>';
          html += '</label>';
        });
      } else {
        html += '<input type="text" class="quiz-text-input" name="q' + i + '" placeholder="' + (strings.type_answer || 'Type your answer...') + '" autocomplete="off">';
      }
    }

    html += '<div class="quiz-explanation" style="display:none;"></div>';
    html += '</div>';
  });

  html += '<div class="quiz-actions">';
  html += '<button type="submit" class="hero-cta quiz-submit">' + (strings.submit || 'Submit Answers') + '</button>';
  html += '<button type="button" class="cta-secondary quiz-reset" style="display:none;">' + (strings.reset || 'Reset Quiz') + '</button>';
  html += '</div>';
  html += '<div id="quiz-results" class="quiz-results" style="display:none;"></div>';
  html += '</form>';

  container.innerHTML = html;

  // Grade
  var form = document.getElementById('quiz-form');
  var resultsEl = document.getElementById('quiz-results');
  var submitBtn = form.querySelector('.quiz-submit');
  var resetBtn = form.querySelector('.quiz-reset');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    grade();
  });

  resetBtn.addEventListener('click', function () {
    form.reset();
    resultsEl.style.display = 'none';
    resetBtn.style.display = 'none';
    submitBtn.style.display = '';
    document.querySelectorAll('.quiz-question').forEach(function (el) {
      el.classList.remove('quiz-correct', 'quiz-incorrect');
      el.querySelector('.quiz-explanation').style.display = 'none';
    });
  });

  function grade() {
    var earned = 0;
    var correct = 0;

    questions.forEach(function (q, i) {
      var qEl = document.querySelector('.quiz-question[data-index="' + i + '"]');
      var expEl = qEl.querySelector('.quiz-explanation');
      var isCorrect = false;
      var pts = q.points || 1;

      if (q.type === 'single_choice' || q.type === 'true_false' || q.type === 'scenario_best_action') {
        var selected = form.querySelector('input[name="q' + i + '"]:checked');
        if (selected) {
          isCorrect = parseInt(selected.value) === q.correct_answer;
        }
      } else if (q.type === 'multi_select') {
        var checked = Array.from(form.querySelectorAll('input[name="q' + i + '"]:checked')).map(function (el) { return parseInt(el.value); }).sort();
        var expected = (q.correct_answer || []).slice().sort();
        isCorrect = JSON.stringify(checked) === JSON.stringify(expected);
      } else if (q.type === 'short_answer') {
        var input = form.querySelector('input[name="q' + i + '"]');
        if (input) {
          var val = input.value.trim().toLowerCase().replace(/^\//, '').replace(/\s+/g, ' ');
          var accepted = (q.accepted_answers || []).map(function (a) { return a.toLowerCase().replace(/^\//, '').replace(/\s+/g, ' '); });
          isCorrect = accepted.indexOf(val) !== -1;
        }
      }

      if (isCorrect) {
        earned += pts;
        correct++;
        qEl.classList.add('quiz-correct');
        qEl.classList.remove('quiz-incorrect');
      } else {
        qEl.classList.add('quiz-incorrect');
        qEl.classList.remove('quiz-correct');
      }

      if (q.explanation) {
        expEl.innerHTML = '<strong>' + (isCorrect ? (strings.correct || 'Correct!') : (strings.incorrect || 'Incorrect.')) + '</strong> ' + escapeHtml(q.explanation);
        if (q.review_link) {
          expEl.innerHTML += ' <a href="' + q.review_link + '">' + (strings.review || 'Review this topic') + ' &rarr;</a>';
        }
        expEl.style.display = 'block';
      }
    });

    var pct = Math.round((earned / totalPoints) * 100);
    var level = pct >= 90 ? (strings.level_expert || 'Expert') :
                pct >= 70 ? (strings.level_solid || 'Solid') :
                pct >= 50 ? (strings.level_developing || 'Developing') :
                (strings.level_review || 'Needs Review');

    resultsEl.innerHTML =
      '<div class="quiz-score">' +
        '<span class="quiz-score-number">' + pct + '%</span>' +
        '<span class="quiz-score-label">' + earned + '/' + totalPoints + ' ' + (strings.points_label || 'points') + '</span>' +
      '</div>' +
      '<div class="quiz-level quiz-level--' + level.toLowerCase().replace(/\s+/g, '-') + '">' + level + '</div>' +
      '<p>' + correct + '/' + questions.length + ' ' + (strings.correct_count || 'correct') + '</p>';

    resultsEl.style.display = 'block';
    submitBtn.style.display = 'none';
    resetBtn.style.display = '';

    // Save best score
    try {
      var key = 'quiz_' + (container.dataset.locale || 'en') + '_' + location.pathname;
      var prev = parseInt(localStorage.getItem(key) || '0');
      if (pct > prev) localStorage.setItem(key, pct);
    } catch (e) { /* localStorage unavailable */ }

    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
