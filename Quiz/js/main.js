class QuizApp {
    constructor() {
        this.questionElement = document.querySelector("h2");
        this.myBox = document.querySelector(".box");
        this.answers = document.querySelectorAll(".response");
        this.bullets = document.querySelector(".box .bullets");
        this.bulletsSpan = null;
        this.countdown = null;
        this.myData = [];
        this.counter = 0;
        this.view = false;
        this.mp = new Map();
        this.checked = [];
        this.score = localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0;
    }

    init() {
        window.addEventListener("load", () => {
            if (!sessionStorage.getItem("login")) {
                window.location.replace("./login.html");
            }
            if (localStorage.getItem("score")) {
                this.resetDisplay();
            }
            if (localStorage.getItem("view")) {
                this.viewYourAnswers();
            }

            document.getElementById("icon").addEventListener("click", () => this.viewAside());
        });

        if (localStorage.getItem("startQuiz")) {
            document.querySelector(".startquiz").remove();
            this.myBox.classList.add("slide-up");
            setTimeout(() => { this.myBox.classList.add("slide-down") }, 200);
            this.getRequest();
            return;
        } else {
            this.startQuiz();
        }
    }

    startQuiz() {
        document.querySelector(".startquiz").classList.add("slide-down");

        this.addItemsToAside();
        this.myBox.style.display = "none";
        document.querySelector("aside button").style.display = "none";

        document.getElementById("startQuiz").addEventListener("click", () => {
            document.querySelector(".startquiz").remove();
            this.myBox.style.display = "block";
            document.querySelector("aside button").style.display = "block";

            this.myBox.classList.add("slide-up");
            setTimeout(() => { this.myBox.classList.add("slide-down") }, 200);

            localStorage.setItem("startQuiz", true);

            this.addItemsToAside();
            this.getRequest();
        })
    }

    getRequest() {
        let myrequest = new XMLHttpRequest();
        myrequest.open("GET", "./Quiz/js/questions.json");
        myrequest.send();
        myrequest.onreadystatechange = () => {
            if (myrequest.readyState === 4 && myrequest.status === 200) {
                this.myData = JSON.parse(myrequest.responseText);

                this.randomQuestons();
                this.createBullets();
                this.loadQuestion();
                this.startTimer();
                this.flagMyQuestion();
                this.addItemsToAside();

                document.getElementById("submit").addEventListener("click", () => this.nextQuestion());
                document.getElementById("prev").addEventListener("click", () => this.prevQuestion());
                document.querySelector("aside button").addEventListener("click", () => this.sure());

                this.answers.forEach(answer => {
                    answer.addEventListener("click", (e) => this.addAnswer(e));
                });

                this.bulletsSpan.forEach(bullet => {
                    bullet.addEventListener("click", () => this.moveToSpan(bullet));
                });
            }
        };
    }

    sure() {
        document.getElementById("popupBox").style.display = "block";

        const func = () => {
            document.getElementById("popupBox").style.display = "none";
            this.resetDisplay();
        }

        document.getElementById("cancelButton").addEventListener("click", () => {
            document.getElementById("popupBox").style.display = "none";
            document.getElementById("okButton").removeEventListener("click", func);
        });

        document.getElementById("okButton").addEventListener("click", func);
    }

    randomQuestons() {
        let randomArr = JSON.parse(JSON.stringify(this.myData.questions));
        let tmp = [];


        while (randomArr.length) {
            let randomNum = Math.floor(Math.random() * randomArr.length);
            tmp.push(randomArr[randomNum]);
            randomArr.splice(randomNum, 1);
        }

        this.myData.questions = tmp;
    }

    createBullets() {
        for (let i = 1; i <= this.myData.questions.length; i++) {
            let span = document.createElement("span");
            span.textContent = i;
            this.bullets.append(span);
            this.checked.push(false);
        }

        this.bulletsSpan = document.querySelectorAll(".box .bullets span");
        this.bulletsSpan[0].className = "active";
    }

    loadQuestion() {
        this.questionElement.classList.remove("question-fade-active");
        document.getElementById("current").textContent = `Q : ${this.counter + 1} / ${this.myData.questions.length} `;
        this.questionElement.textContent = this.myData.questions[this.counter].question;

        for (let i = 0; i < this.answers.length; i++) {
            this.answers[i].textContent = this.myData.questions[this.counter].answers[i];
            this.bulletsSpan[this.counter].classList.remove("checked");

            if (this.myData.questions[this.counter].choosen_answer === this.myData.questions[this.counter].answers[i]) {
                this.answers[i].classList.add("active");
            } else {
                this.answers[i].classList.remove("active");
            }

            if (localStorage.getItem("viewed")) this.borderTheCorrect();
        }

        if (this.counter) this.bulletsSpan[this.counter - 1].classList.remove("active");
        if (this.counter < this.myData.questions.length - 1) this.bulletsSpan[this.counter + 1].classList.remove("active");
        this.questionElement.classList.add("question-fade-active");
        this.bulletsSpan[this.counter].classList.add("active");
        document.getElementById("submit").classList.remove("no-drop");
    }

    borderTheCorrect() {
        for (let i = 0; i < this.answers.length; i++) {

            if (this.myData.questions[this.counter].correct_answer == this.myData.questions[this.counter].choosen_answer) {
                if (this.myData.questions[this.counter].answers[i] == this.myData.questions[this.counter].correct_answer) {
                    this.answers[i].style.border = "5px solid green";
                } else {
                    this.answers[i].style.border = "1px solid var(--secondaryColor)";
                }
            } else {
                if (this.myData.questions[this.counter].choosen_answer == this.myData.questions[this.counter].answers[i]) {
                    this.answers[i].style.border = "5px solid red";
                } else if (this.myData.questions[this.counter].correct_answer == this.myData.questions[this.counter].answers[i]) {
                    this.answers[i].style.border = "5px solid green";
                } else {
                    this.answers[i].style.border = "1px solid var(--secondaryColor)";
                }
            }

            this.answers[i].style.pointerEvents = "none";
        }
    }

    nextQuestion() {
        if (this.counter < this.myData.questions.length - 1) {
            if (this.checked[this.counter]) this.bulletsSpan[this.counter].classList.add("checked");
            this.counter++;
            this.loadQuestion();
            this.animateIn();

        } else { // submit
            this.sure();
        }

        if (this.counter == this.myData.questions.length - 1 && !localStorage.getItem("viewed")) {
            document.getElementById("submit").textContent = "Sumbit";
        } else if (this.counter == this.myData.questions.length - 1) {
            document.getElementById("submit").classList = "no-drop";
        }
    }

    prevQuestion() {
        if (this.checked[this.counter]) this.bulletsSpan[this.counter].classList.add("checked");
        if (this.counter > 0) {
            this.counter--;
            this.animateOut();
        }
        document.getElementById("submit").textContent = "Next";
        this.loadQuestion();
    }

    fullmark() {
        // when we get the full mark
        // this.questionElement.style.fontSize = "25px";
        this.questionElement.style.fontWeight = "normal";
        this.questionElement.textContent = "Congrats You got The Full Mark ! 👏👏";

        let myimg = document.createElement("img");
        myimg.src = "./Quiz/images/yes-baby.gif";
        myimg.classList.add("winnerImg")
        myimg.alt = "Congrats!";
        myimg.style.width = "150px";
        myimg.style.height = "120px";
        myimg.style.borderRadius = "16px";
        document.querySelector(".landing .questionAnswer").style.height = "35%";
        myimg.style.alignSelf = "center"
        this.myBox.append(myimg);
    }

    resetDisplay() {
        this.checkAnswer();
        this.myBox.classList = "final-Box";

        if (localStorage.getItem("score") == this.myData.questions.length) {
            this.fullmark();
        } else if (localStorage.getItem("timer").split(",")[0] == 0 && localStorage.getItem("timer").split(",")[1] == 0) {
            this.questionElement.textContent = "Time Out!";
            this.timeOut()
        } else {
            this.questionElement.textContent = "Submit Successfully 👍";
        }


        let parentScore = document.createElement("div");
        parentScore.classList = "parent-score";

        let scoreDiv = document.createElement("div");
        scoreDiv.classList.add("scoreDiv");
        scoreDiv.textContent = `Your Result :  ${this.score} / ${this.myData.questions.length}`;

        let viewAnswers = document.createElement("button");
        viewAnswers.textContent = "View Answers";
        viewAnswers.classList = "view-answers";

        parentScore.append(scoreDiv);
        parentScore.append(viewAnswers);

        // because when we sumbit and time is out the result is print twice to this comditiom handle this
        if (this.myBox.children.length == 4 || this.myBox.children.length == 5) {
            this.myBox.append(parentScore);
        }

        let landing = document.querySelector(".landing");
        landing.style.backgroundImage = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 100\' fill=\'%2350586C\'><path d=\'M0 0v90.2C49.7 99.9 105 82 160 65c75.5-23.3 145.5-22.4 222-3 63 16 119 14 173-8 79.5-32.4 156.2-27.6 240-10 82.6 17.4 143-1 205-31.7V0H0Z\'></path></svg>")';
        landing.style.backgroundColor = "var(--secondaryColor)";
        landing.style.height = "95vh";

        // The arrow in mobile
        document.querySelector("aside #icon").style.color = 'var(--mainColor)';

        this.elements("none");
        clearInterval(this.countdown);

        document.querySelector(".view-answers").addEventListener("click", () => this.viewYourAnswers());
    }

    viewYourAnswers() {
        this.bulletsSpan[this.counter].classList.remove("active");
        this.counter = 0;
        this.elements("flex");
        this.myBox.classList = "box";
        localStorage.setItem("viewed", true);

        document.querySelector(".parent-score").remove();
        if (document.querySelector(".box img")) document.querySelector(".box img").remove();

        this.loadQuestion();
        document.querySelector("#submit").textContent = "Next";


        this.counter = 0;
    }

    elements(status) {
        document.querySelector(".btns").style.display = status;
        document.querySelector(".info").style.display = status;
        document.querySelector(".answers").style.display = status;
        document.querySelector("aside button").style.display = status;
        this.bullets.style.display = status;

        if (status == "flex") {
            document.querySelector("aside button").style.display = "none";
            this.questionElement.style.color = "var(--secondaryColor)";
            document.querySelector(".landing .questionAnswer").style.height = "60%";
        }
    }

    startTimer() {
        let timerSec = 30;
        let timerMin = 1;

        if (localStorage.getItem("timer")) {
            timerMin = localStorage.getItem("timer").split(",")[0];

            timerSec = localStorage.getItem("timer").split(",")[1] - 1;
            if (timerSec == -1) timerSec = 0;
        }

        this.updateDisplay(timerSec, timerMin);

        this.countdown = setInterval(() => {

            if (timerSec > 0) {
                timerSec--;
            } else if (timerMin > 0) {
                timerMin--;
                timerSec = 59;
            } else {
                clearInterval(this.countdown);
                this.resetDisplay();
                return;
            }

            localStorage.setItem("timer", `${timerMin},${timerSec}`);
            this.updateDisplay(timerSec, timerMin);
        }, 1000);
    }

    updateDisplay(timerSec, timerMin) {
        document.getElementById("minutes").textContent = timerMin.toString().padStart(2, "0");
        document.getElementById("seconds").textContent = timerSec.toString().padStart(2, "0");
    }

    timeOut() {
        let timerImg = document.createElement("img");
        timerImg.classList = "timerImage";
        timerImg.src = "./Quiz/images/Clock_vectoricon (1).png";
        timerImg.style.width = "100px";
        timerImg.style.height = "100px";
        this.questionElement.parentElement.append(timerImg);

        let audio = new Audio('./Quiz/clock-alarm-8761.mp3');
        audio.play();


        this.questionElement.style.fontSize = "30px";
        this.questionElement.style.color = "red";

    }

    addAnswer(e) {
        this.myData.questions[this.counter].choosen_answer = e.target.textContent;
        this.answers.forEach(answer => answer.classList.remove("active"));
        e.target.classList.add("active");
        this.checked[this.counter] = true;
    }

    moveToSpan(bullet) {
        if (this.checked[this.counter]) this.bulletsSpan[this.counter].classList.add("checked");
        this.bulletsSpan[this.counter].classList.remove("active");
        this.counter = bullet.textContent - 1;

        this.loadQuestion();

        if (this.counter == this.myData.questions.length - 1 && !localStorage.getItem("viewed")) {
            document.getElementById("submit").textContent = "Sumbit";
        } else if (this.counter == this.myData.questions.length - 1) {
            document.getElementById("submit").classList = "no-drop";
        } else {
            document.getElementById("submit").textContent = "Next";
        }
    }

    flagMyQuestion() {
        document.getElementById("myflag").addEventListener("click", () => {
            let flagedQuestion = document.createElement("div");
            flagedQuestion.innerHTML = `<span><i class="fa-solid fa-flag"></i></span>Question ${this.counter + 1}`;

            if (!this.mp.get(this.counter)) {
                document.querySelector("aside .flags").append(flagedQuestion);
                this.mp.set(this.counter, true);

                flagedQuestion.addEventListener("click", () => {
                    let cnt = flagedQuestion.textContent.split(" ")[1];
                    this.bulletsSpan[this.counter].classList.remove("active");
                    this.counter = parseInt(cnt) - 1;
                    this.loadQuestion();
                });
            }
        });
    }

    checkAnswer() {
        if (localStorage.getItem("score")) return;

        this.myData.questions.forEach(question => {
            if (question.correct_answer === question.choosen_answer) {
                this.score += 1;
            }



        });

        localStorage.setItem("score", this.score);
    }

    addItemsToAside() {
        let aside = document.querySelector("aside");
        if (localStorage.getItem("photo")) {
            aside.children[1].src = localStorage.getItem("photo");
        }
        aside.children[2].textContent = `${localStorage.getItem("firstName")} ${localStorage.getItem("secondName")}`;
    }

    viewAside() {
        const aside = document.querySelector("aside");

        if (this.view === false) {
            this.view = true;
            aside.style.right = "0px";
            aside.style.filter = "drop-shadow(-8px 5px 5px black)";

        } else {
            this.view = false;
            aside.style.right = "-150px";
            aside.style.filter = "none";
        }
    }

    animateOut() {
        this.questionElement.classList.add("slide-in-right");
        this.answers.forEach(answer => answer.classList.add("slide-in-right"));

        setTimeout(() => {
            this.questionElement.classList.remove("slide-in-right");
            this.answers.forEach(answer => answer.classList.remove("slide-in-right"));
        }, 300);
    }

    animateIn() {
        this.questionElement.classList.add("slide-out-left");
        this.answers.forEach(answer => answer.classList.add("slide-out-left"));

        setTimeout(() => {
            this.questionElement.classList.remove("slide-out-left");
            this.answers.forEach(answer => answer.classList.remove("slide-out-left"));
        }, 300);
    }
}


let osama = new QuizApp();
osama.init();


// localStorage.clear();
// sessionStorage.clear();