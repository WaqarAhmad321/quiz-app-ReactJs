import { useQuiz } from "../contexts/QuizContext";

function Progress() {
  const { index, points, numQuestions, maxPoints } = useQuiz();
  return (
    <header className="progress">
      <progress max={numQuestions} value={index} />
      <p>
        Question <strong>{index + 1}</strong>/{numQuestions}
      </p>

      <p>
        <strong>{points}</strong>/{maxPoints}
      </p>
    </header>
  );
}

export default Progress;
