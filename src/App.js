import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { insertCoin, selectWash, cancelWash } from "./PreWash";
import {
  updateDoorLock,
  updateProgress,
  startWashingProcess,
} from "./WashingProgress";
import {
  updateTotalTimeSwitchedOn,
  getStatistics,
  resetStatistics,
} from "./Maintenance";

function App() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedWash, setSelectedWash] = useState(null);
  const [message, setMessage] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isWashing, setIsWashing] = useState(false);
  const [doorStatus, setDoorStatus] = useState("Unlocked");
  const [totalTimeSwitchedOn, setTotalTimeSwitchedOn] = useState(0);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const washTimerRef = useRef(null); // Timer for washing cycle
  const maintenanceTimerRef = useRef(null); // Timer for maintenance statistics

  const washes = [
    { name: "Quick Wash", duration: 10 * 60, cost: 2 },
    { name: "Mild Wash", duration: 30 * 60, cost: 2.5 },
    { name: "Medium Wash", duration: 45 * 60, cost: 4.2 },
    { name: "Heavy Wash", duration: 60 * 60, cost: 6 },
  ];

  useEffect(() => {
    if (isWashing) {
      // Start the timer for washing
      // washTimerRef.current = setInterval(() => {
      //   console.log("setElapsedTime---useEffect(isWashing)");
      //   setElapsedTime((prevTime) => prevTime + 1); // Increment elapsed time by 1 second
      // }, 1000);

      // Start the maintenance timer
      maintenanceTimerRef.current = setInterval(() => {
        updateTotalTimeSwitchedOn(1);
        setTotalTimeSwitchedOn((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(washTimerRef.current); // Clear the washing timer when washing stops
      clearInterval(maintenanceTimerRef.current); // Clear the maintenance timer when washing stops
    }

    return () => {
      clearInterval(washTimerRef.current); // Cleanup on unmount
      clearInterval(maintenanceTimerRef.current); // Cleanup on unmount
    };
  }, [isWashing]);

  const handleStartWashing = (wash) => {
    console.log("setElapsedTime(0)");
    setElapsedTime(0); // Reset elapsed time at the start of a new wash
    startWashingProcess(
      wash.duration,
      setElapsedTime,
      setIsWashing,
      setDoorStatus
    );
  };

  const handleWashSelection = (wash) => {
    const newAmount = selectWash(
      wash,
      totalAmount,
      setMessage,
      setSelectedWash
    );

    if (newAmount < 0) {
      setInsufficientFunds(true);
      setMessage(`Insufficient funds for ${wash.name}. Please add more money.`);
    } else {
      setInsufficientFunds(false);
      setTotalAmount(newAmount);
      if (newAmount === 0) {
        handleStartWashing(wash);
      }
    }
  };

  const progress = updateProgress(
    selectedWash ? selectedWash.duration : 0,
    elapsedTime
  );

  const handleResetStatistics = () => {
    resetStatistics();
    setMessage("Statistics have been reset.");
    setTotalTimeSwitchedOn(0);
  };

  const statistics = getStatistics();

  return (
    <div className="App">
      <h1>Washing Machine</h1>
      <div className="grid-container">
        <div className="left-column">
          <h3>Total Amount Inserted: ${totalAmount.toFixed(2)}</h3>
          <div>
            <h4>Insert Coins:</h4>
            <button
              className="coin-button"
              onClick={() => setTotalAmount(insertCoin(0.1, totalAmount))}
            >
              10¢
            </button>
            <button
              className="coin-button"
              onClick={() => setTotalAmount(insertCoin(0.2, totalAmount))}
            >
              20¢
            </button>
            <button
              className="coin-button"
              onClick={() => setTotalAmount(insertCoin(0.5, totalAmount))}
            >
              50¢
            </button>
            <button
              className="coin-button"
              onClick={() => setTotalAmount(insertCoin(1, totalAmount))}
            >
              1 Dollar
            </button>
          </div>
          <div>
            <h4>Select Wash Type:</h4>
            {washes.map((wash, index) => (
              <div key={index}>
                <button
                  className="coin-button"
                  onClick={() => handleWashSelection(wash)}
                  disabled={isWashing && !insufficientFunds}
                >
                  {wash.name} - {wash.duration / 60} minutes - $
                  {wash.cost.toFixed(2)}
                </button>
              </div>
            ))}
          </div>
          <div>
            <button
              className="cancel-button"
              onClick={() =>
                setTotalAmount(
                  cancelWash(totalAmount, setMessage, setSelectedWash)
                )
              }
              disabled={isWashing}
            >
              Cancel and Refund
            </button>
          </div>
          {message && <p>{message}</p>}
        </div>

        <div className="right-column">
          {selectedWash && (
            <div>
              <h4>
                Selected: {selectedWash.name} - {selectedWash.duration / 60}{" "}
                minutes
              </h4>
              {isWashing && (
                <div>
                  <h4>
                    Washing Progress: {progress.progressPercentage.toFixed(0)}%
                  </h4>
                  <h4>
                    Remaining Time: {Math.floor(progress.remainingTime)} seconds
                  </h4>
                  <h4>Door Status: {doorStatus}</h4>
                </div>
              )}
            </div>
          )}
          <br />
          <h2>Maintenance Statistics</h2>
          <p>Total Time Switched On: {totalTimeSwitchedOn} seconds</p>
          <p>Total Money Earned: ${statistics.totalMoneyEarned}</p>
          <button className="reset-button" onClick={handleResetStatistics}>
            Reset Statistics
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
