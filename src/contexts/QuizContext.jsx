import { createContext, useContext, useReducer, useEffect } from "react";

const QuizContext = createContext(QuizProvider);

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  status: "Loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataRecieved":
      return { ...state, questions: action.payload, status: "ready" };

    case "dataFailed":
      return { ...state, status: "error" };

    case "start":
      return { ...state, status: "active" };

    case "newAnswer":
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };

    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };

    case "finish":
      return {
        ...state,
        status: "finish",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };

    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
      };

    case "tick":
      return {
        ...state,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Unknown Action.");
  }
}

function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    questions,
    status,
    index,
    answer,
    points,
    highscore,
    secondsRemaining,
  } = state;
  const numQuestions = questions.length;
  const maxPoints = questions.reduce((pre, cur) => pre + cur.points, 0);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const url = `http://localhost:9000/questions`;
        let res = await fetch(url);
        let data = await res.json();
        dispatch({ type: "dataRecieved", payload: data });
      } catch (error) {
        dispatch({ type: "dataFailed" });
      }
    }
    fetchQuestions();
  }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        status,
        index,
        answer,
        points,
        highscore,
        secondsRemaining,
        dispatch,
        maxPoints,
        numQuestions,
      }}>
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error("The Quiz Context was used outside the Provider.");
  return context;
}

export { QuizProvider, useQuiz };
