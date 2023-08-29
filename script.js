// TODO(you): Write the JavaScript necessary to complete the assignment.
//screens
const screen1 = document.querySelector("#introduction");
const screen2 = document.querySelector("#attempt-quiz");
const screen3 = document.querySelector("#review-quiz");
//container
const questionContainer = document.querySelector("#question-container");
const reviewQuestionContainer = document.querySelector("#review-question-container");
//buttons
const btnStart = document.querySelector("#btn-start");
const btnSubmit = document.querySelector("#btn-submit");
const btnTryAgain = document.querySelector("#btn-try-again");

const body = document.querySelector("body");


const labels = document.querySelectorAll("label")
labels.forEach(label => {
    label.addEventListener("click", event => {
        let optionSelected = document.querySelector(".option-selected");
        if (optionSelected) {
            optionSelected.classList.remove("option-selected");
        }
        event.currentTarget.classList.add("option-selected");
    })
})

//hide on start
screen2.classList.add("hidden");
screen3.classList.add("hidden");

let attemptID;

//start quiz
function startQuiz() {
    body.scrollIntoView({ block: "start" })
    screen1.classList.add("hidden");
    screen2.classList.remove("hidden");
    fetch('https://wpr-quiz-api.herokuapp.com/attempts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(json => {
            console.log("Data: ");
            console.log(json);
            attemptId = json._id

            const questionArr = json.questions;
            questionArr.forEach((question, index) => {

                const id = question._id
                const answerArray = question.answers
                const text = question.text

                const divContainer = document.createElement("div")
                const h2 = document.createElement("h2")
                h2.classList.add("question-index")
                h2.textContent = `Question ${index + 1} of 10`

                const questionText = document.createElement("div")
                questionText.classList.add("question-text")
                questionText.textContent = text

                const form = document.createElement("form")
                form.classList.add("form")

                answerArray.forEach((answer, index) => {

                    const label = document.createElement("label")
                    label.classList.add("option")

                    const input = document.createElement("input")
                    input.type = 'radio'
                    input.name = id
                    input.value = index

                    const p = document.createElement("p")
                    p.classList.add("opt-text")
                    p.textContent = answer

                    label.appendChild(input)
                    label.appendChild(p)
                    form.appendChild(label)
                })


                divContainer.appendChild(h2)
                divContainer.appendChild(questionText)
                divContainer.appendChild(form)
                questionContainer.appendChild(divContainer)


                const answersInForm = form.querySelectorAll(".option")
                answersInForm.forEach(answer => {
                    answer.addEventListener("click", e => {
                        const checkedSibling = form.querySelector(".option-selected")
                        if (checkedSibling) {
                            checkedSibling.classList.remove("option-selected")
                        }
                        e.currentTarget.classList.add("option-selected")
                    })
                })


            })
        })
}
btnStart.addEventListener("click", startQuiz);



//submit quiz
function submitAnswers() {
    if (confirm("Are you sure want to finish this quiz?") == true) {
        body.scrollIntoView({ block: "start" })
        screen2.classList.add("hidden");
        screen3.classList.remove("hidden");

        const result = {
            userAnswers: {

            }
        }

        const selectLabels = document.querySelectorAll(".option-selected")
        selectLabels.forEach(label => {
            const inputTag = label.querySelector("input")
            const questionId = inputTag.name
            const answerIndex = inputTag.value

            result.userAnswers[questionId] = answerIndex
        })


        fetch(`https://wpr-quiz-api.herokuapp.com/attempts/${attemptId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        })
            .then(res => res.json())
            .then(json => {
                console.log("received from server: ");
                console.log(json);

                const userAnswers = json.userAnswers || {}
                const correctAnswers = json.correctAnswers
                const score = json.score
                const scoreText = json.scoreText

                const questionArr = json.questions;
                questionArr.forEach((question, index) => {

                    const questionId = question._id
                    const answerArray = question.answers
                    const text = question.text

                    const divContainer = document.createElement("div")
                    const h2 = document.createElement("h2")
                    h2.classList.add("question-index")
                    h2.textContent = `Question ${index + 1} of 10`

                    const questionText = document.createElement("div")
                    questionText.classList.add("question-text")
                    questionText.textContent = text

                    const form = document.createElement("form")
                    form.classList.add("form")

                    answerArray.forEach((answer, index) => {

                        const userLabel = document.createElement("label")
                        userLabel.classList.add("option")

                        const input = document.createElement("input")
                        input.type = 'radio'
                        input.name = questionId
                        input.value = index

                        const p = document.createElement("p")
                        p.classList.add("opt-text")
                        p.textContent = answer

                        userLabel.appendChild(input)
                        userLabel.appendChild(p)
                        form.appendChild(userLabel)

                        if (userAnswers[questionId] == index) {
                            input.checked = true
                        }
                    })

                    const positionCorrectAnswer = correctAnswers[questionId]
                    const labelCorrectAnswer = form.childNodes[positionCorrectAnswer]
                    const correctConfirmAnswer = confirmAnswer("Correct answer")
                    labelCorrectAnswer.appendChild(correctConfirmAnswer)

                    if (userAnswers[questionId]) {

                        const positionOfUserAnswer = userAnswers[questionId]
                        const userLabel = form.childNodes[positionOfUserAnswer]
                        if (userAnswers[questionId] == correctAnswers[questionId]) {

                            userLabel.classList.add("correct-answer")


                        } else {

                            userLabel.classList.add("wrong-answer")
                            const wrongConfirmAnswer = confirmAnswer("Your answer")
                            userLabel.appendChild(wrongConfirmAnswer)

                            labelCorrectAnswer.classList.add("correct-answer")

                        }

                    } else {

                        labelCorrectAnswer.classList.add("option-correct")

                    }

                    divContainer.appendChild(h2)
                    divContainer.appendChild(questionText)
                    divContainer.appendChild(form)
                    reviewQuestionContainer.appendChild(divContainer)

                })

                document.querySelector("#box-result #number-of-correct-answer").textContent = `${score}/10`
                document.querySelector("#correct-percent").textContent = `${score * 100 / 10}%`
                document.querySelector("#box-result #score-text").textContent = scoreText

            })

    }
}

btnSubmit.addEventListener("click", submitAnswers);

//lable answer
function confirmAnswer(message) {
    const lableAnswer = document.createElement("label")
    lableAnswer.classList.add("lable-answer")
    lableAnswer.textContent = message
    return lableAnswer;
}


//restart quiz
function refreshQuiz() {
    let checkedRadios = document.querySelectorAll("input[type='radio']:checked")
    checkedRadios.forEach(radio => {
        radio.checked = false;
    })

    let selectedOptions = document.querySelectorAll(".option-selected")
    selectedOptions.forEach(option => {
        option.classList.remove("option-selected");
    })
}

//try again
function tryAgain() {
    location.reload();
}

btnTryAgain.addEventListener("click", tryAgain);
