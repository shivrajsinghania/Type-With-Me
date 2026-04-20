document.addEventListener("DOMContentLoaded", function() {

  let correct = 0
  let totalTyped = 0
  let startTime = null
  let index = 0
  let testEnded = false

  let wpmDisplay = document.getElementById("wpm")
  let accuracyDisplay = document.getElementById("accuracy")
  let timeDisplay = document.getElementById("time")
  let textElement = document.getElementById("text")

  let paragraphs = [
    "The world is constantly changing as countries grow, populations shift, and new challenges emerge.",
    "Modern society moves fast, with people balancing work, family, and personal goals.",
    "Sports bring excitement, discipline, and unity among people.",
    "Cricket is more than just a game in many countries; it is an emotion.",
    "Gaming has become a major part of modern entertainment."
  ]

  // create spans
  text.split("").forEach(char => {
    let span = document.createElement("span")
    span.innerText = char
    textElement.appendChild(span)
  })

  let spans = textElement.querySelectorAll("span")
  spans[index].classList.add("current")

  // ✅ END TEST FUNCTION (OUTSIDE keydown)
  function endTest() {
  testEnded = true

  let totalTime = Math.floor((new Date() - startTime) / 1000)

  let finalWPM = Math.round((correct / 5) / (totalTime / 60)) || 0
  let finalAccuracy = totalTyped > 0
    ? Math.round((correct / totalTyped) * 100)
    : 0

  document.getElementById("finalWPM").innerText = finalWPM
  document.getElementById("finalAccuracy").innerText = finalAccuracy
  document.getElementById("finalTime").innerText = totalTime

  // 👉 FIRST get previous result
  fetch("/last_result")
    .then(res => res.json())
    .then(last => {

      let arrow = "-"

      if (last.wpm !== null) {
        arrow = finalWPM > last.wpm ? "⬆️" : "⬇️"
      }

      // 👉 NOW update UI (after arrow is ready)
      document.getElementById("comparison").innerText = arrow

      // 👉 THEN save result
      return fetch("/save_result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wpm: finalWPM,
          accuracy: finalAccuracy,
          time: totalTime
        })
      })
    })
    .then(res => res.json())
    .then(data => console.log("Saved:", data))

  // 👉 SHOW RESULT BOX LAST
  document.getElementById("resultBox").style.display = "block"
}

  // ✅ KEYDOWN LOGIC
  document.addEventListener("keydown", function(event) {

    if (testEnded) return

    if (!startTime) {
      startTime = new Date()
    }

    let typedKey = event.key

    if (typedKey.length > 1) return

    let currentChar = spans[index].innerText

    spans[index].classList.remove("correct", "wrong")

    totalTyped++

    if (typedKey === currentChar) {
      correct++
      spans[index].classList.add("correct")
    } else {
      spans[index].classList.add("wrong")
    }

    // update stats
    let timePassed = (new Date() - startTime) / 1000 / 60
    let wpm = timePassed > 0 ? Math.round((correct / 5) / timePassed) : 0
    let accuracy = Math.round((correct / totalTyped) * 100) || 100

    wpmDisplay.innerText = wpm
    accuracyDisplay.innerText = accuracy

    spans[index].classList.remove("current")

    index++

    // ✅ CHECK END AFTER INCREMENT (correct place)
    if (index >= spans.length) {
      endTest()
      return
    }

    spans[index].classList.add("current")
  })

  // ✅ TIMER
  let timer = setInterval(() => {
    if (startTime && !testEnded) {
      let seconds = Math.floor((new Date() - startTime) / 1000)
      timeDisplay.innerText = seconds
    }

    if (testEnded) {
      clearInterval(timer)
    }
  }, 1000)

})


// ✅ GLOBAL (important for button)
function restartTest() {
  location.reload()
}
