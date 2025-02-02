"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Option {
  id: number
  description: string
  is_correct: boolean
}

interface Question {
  id: number
  description: string
  options: Option[]
  detailed_solution: string
  topic: string
}

interface QuizData {
  id: number
  title: string
  description: string
  topic: string
  duration: number
  questions: Question[]
  difficulty_level: string | null
  correct_answer_marks: string
  negative_marks: string
}

export default function Quiz() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setfetchError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [showDetailedSolutions, setShowDetailedSolutions] = useState(false)

  useEffect(() => {
    fetchQuizData()
    const savedHighScore = localStorage.getItem('quizHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  useEffect(() => {
    if (quizStarted && quizData && !timeRemaining) {
      setTimeRemaining(quizData.duration * 60)
    }

    if (timeRemaining && timeRemaining > 0 && !showResults && quizStarted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev ? prev - 1 : null)
      }, 1000)

      return () => clearInterval(timer)
    } else if (timeRemaining === 0) {
      setShowResults(true)
    }
  }, [timeRemaining, quizData, showResults, quizStarted])

  const fetchQuizData = async () => {
    try {
      const response = await fetch("/api/quiz")
      if (!response.ok) {
        throw new Error("Failed to fetch quiz data")
      }
      const data = await response.json()
      setQuizData(data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setfetchError("Failed to load quiz data. Please try again later.")
      setLoading(false)
    }
  }

  const handleAnswer = (selectedOptionId: number) => {
    if (!quizData) return

    const currentQuestion = quizData.questions[currentQuestionIndex]
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId)
    const previousAnswer = selectedAnswers[currentQuestion.id]

    if (previousAnswer) {
      const previousOption = currentQuestion.options.find(opt => opt.id === previousAnswer)
      if (previousOption?.is_correct) {
        setScore(prev => prev - Number(quizData.correct_answer_marks))
      } else {
        setScore(prev => prev + Number(quizData.negative_marks))
      }
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOptionId
    }))

    if (selectedOption?.is_correct) {
      setScore(prev => prev + Number(quizData.correct_answer_marks))
    } else {
      setScore(prev => prev - Number(quizData.negative_marks))
    }
  }

  const handleNext = () => {
    if (!quizData) return

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleQuizComplete()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuizComplete = () => {
    setShowResults(true)
    const finalScore = score
    if (finalScore > highScore) {
      setHighScore(finalScore)
      localStorage.setItem('quizHighScore', finalScore.toString())
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setTimeRemaining(quizData?.duration ? quizData.duration * 60 : null)
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowResults(false)
    setSelectedAnswers({})
    setQuizStarted(false)
    if (quizData) {
      setTimeRemaining(quizData.duration * 60)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" />
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-100" />
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-200" />
      </div>
    )
  }

  if (fetchError || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-red-500 text-2xl text-center">{fetchError || "Quiz data not available"}</div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-2xl w-full mx-auto my-10 text-center"
        >
          <motion.h1
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {quizData.title}
          </motion.h1>
          <p className="text-gray-600 mb-8 text-lg">{quizData.description}</p>
          <div className="mb-8 space-y-3">
            <div className="p-4 bg-white/50 rounded-lg">
              <p className="text-lg font-semibold text-blue-800">Topic: {quizData.topic}</p>
              <p className="text-lg text-gray-700">Duration: {quizData.duration} minutes</p>
              <p className="text-lg text-gray-700">Questions: {quizData.questions.length}</p>
            </div>
            {highScore > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xl text-blue-800 font-bold">High Score: {highScore}</p>
              </div>
            )}
          </div>
          <motion.button
            onClick={startQuiz}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:opacity-90 transition duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Quiz
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {showResults ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Quiz Complete!
          </h2>
          <div className="space-y-6 mb-8">
            <div className="bg-white/50 p-6 rounded-xl">
              <p className="text-3xl font-bold text-blue-800 mb-2">Score: {score}</p>
              {score > highScore && (
                <motion.p
                  className="text-xl text-green-600 font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  New High Score! 🎉
                </motion.p>
              )}
              <p className="text-lg mt-4">
                Correct Answers: {
                  Object.entries(selectedAnswers).filter(([questionId, answerId]) =>
                    quizData.questions.find(q => q.id.toString() === questionId)?.options.find(o => o.id === answerId)?.is_correct
                  ).length
                } / {quizData.questions.length}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => setShowDetailedSolutions(!showDetailedSolutions)}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition duration-300 border-2 border-blue-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showDetailedSolutions ? "Hide Solutions" : "Show Solutions"}
              </motion.button>
              <motion.button
                onClick={restartQuiz}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </div>

          {showDetailedSolutions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left space-y-6 mt-8"
            >
              {quizData.questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id]

                return (
                  <div key={question.id} className="bg-white/50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Question {index + 1}</h3>
                    <p className="mb-4">{question.description}</p>
                    <div className="space-y-2">
                      {question.options.map(option => (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg ${option.is_correct
                            ? 'bg-green-100 border-2 border-green-500'
                            : option.id === userAnswer && !option.is_correct
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-white'
                            }`}
                        >
                          {option.description}
                          {option.is_correct && ' ✓'}
                          {option.id === userAnswer && !option.is_correct && ' ✗'}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-white/80 p-4 rounded-lg">
                      <p className="font-semibold">Solution:</p>
                      <p>{question.detailed_solution}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-3xl w-full mx-auto my-10"
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  {quizData.title}
                </h1>
                {timeRemaining !== null && (
                  <div className="text-lg font-semibold px-4 py-2 bg-blue-100 rounded-lg text-blue-800">
                    ⏱️ {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/50 p-6 rounded-xl"
            >
              <h2 className="text-2xl font-bold mb-4">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </h2>
              <p className="text-xl mb-6">{quizData.questions[currentQuestionIndex].description}</p>
              <div className="space-y-4">
                {quizData.questions[currentQuestionIndex].options.map((option) => {
                  const isSelected = selectedAnswers[quizData.questions[currentQuestionIndex].id] === option.id

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={`w-full text-left p-4 rounded-lg transition duration-300 ease-in-out ${isSelected
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white hover:bg-blue-50 border-2 border-transparent'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.description}
                    </motion.button>
                  )
                })}
                <div className="flex justify-between mt-6">
                  <motion.button
                    onClick={handlePrevious}
                    className={`px-6 py-3 rounded-xl font-semibold transition duration-300 border-2 ${currentQuestionIndex === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                      }`}
                    disabled={currentQuestionIndex === 0}
                    whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.05 }}
                    whileTap={{ scale: currentQuestionIndex === 0 ? 1 : 0.95 }}
                  >
                    Previous
                  </motion.button>

                  {currentQuestionIndex < quizData.questions.length - 1 ? (
                    <motion.button
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl font-semibold transition duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                    </motion.button>

                  ) : (
                    <motion.button
                      onClick={handleQuizComplete}
                      className={`px-6 py-3 rounded-xl font-semibold transition duration-300 ${selectedAnswers[quizData.questions[currentQuestionIndex].id]
                        ? "bg-green-600 text-white hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      disabled={!selectedAnswers[quizData.questions[currentQuestionIndex].id]}
                      whileHover={{ scale: selectedAnswers[quizData.questions[currentQuestionIndex].id] ? 1.05 : 1 }}
                      whileTap={{ scale: selectedAnswers[quizData.questions[currentQuestionIndex].id] ? 0.95 : 1 }}
                    >
                      Finish Quiz
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
};