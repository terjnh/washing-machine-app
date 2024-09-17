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
  const [totalMoneyEarned, setTotalMoneyEarned] = useState(0);

  const washTimerRef = useRef(null); // Timer for single washing cycle
  const maintenanceTimerRef = useRef(null); // Timer for maintenance statistics

  const washes = [
    { name: "Test Wash 1", duration: 1 * 6, cost: 2 },
    { name: "Test Wash 2", duration: 1 * 12, cost: 2.5 },
    { name: "Test Wash 3", duration: 1 * 18, cost: 4.2 },
    { name: "Test Wash 4", duration: 1 * 24, cost: 6 },
    { name: "Quick Wash", duration: 10 * 60, cost: 2 },
    { name: "Mild Wash", duration: 30 * 60, cost: 2.5 },
    { name: "Medium Wash", duration: 45 * 60, cost: 4.2 },
    { name: "Heavy Wash", duration: 60 * 60, cost: 6 },
  ];

  useEffect(() => {
    const stats = getStatistics();
    setTotalTimeSwitchedOn(stats.totalTimeSwitchedOn);
    setTotalMoneyEarned(stats.totalMoneyEarned);
  }, []);

  useEffect(() => {
    if (isWashing) {
      // Start the maintenance timer - 1000ms between each execution
      maintenanceTimerRef.current = setInterval(() => {
        updateTotalTimeSwitchedOn(1);
        setTotalTimeSwitchedOn((prev) => prev + 1);
      }, 1000);
    } else {
      // clear the timers when washing stops
      clearInterval(washTimerRef.current);
      clearInterval(maintenanceTimerRef.current);
    }

    // Cleanup upon unmount
    return () => {
      clearInterval(washTimerRef.current);
      clearInterval(maintenanceTimerRef.current);
    };
  }, [isWashing]);

  const handleStartWashing = (wash) => {
    setElapsedTime(0); // start of new wash -> reset elapsed timer
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

    // console.log("newAmount=", newAmount);
    if (newAmount < 0) {
      setInsufficientFunds(true);
      setMessage(`Insufficient funds for ${wash.name}. Please add more money.`);
    } else {
      setInsufficientFunds(false);
      setTotalAmount(newAmount);
      if (newAmount === 0) {
        handleStartWashing(wash);
        setTotalMoneyEarned((prevAmount) => prevAmount + wash.cost);
      }
    }
  };

  const progress = updateProgress(
    selectedWash ? selectedWash.duration : 0,
    elapsedTime
  );

  const handleResetStatistics = () => {
    resetStatistics();
    setTotalMoneyEarned(0);
    setTotalTimeSwitchedOn(0);
    setMessage("Statistics have been reset.");
  };

  const statistics = getStatistics();

  return (
    <div className="App">
      <h1>Washing Machine</h1>
      <div className="grid-container">
        <div className="left-column">
          <h3>Total Amount Inserted: ${totalAmount.toFixed(2)}</h3>
          <div className="status-box">{message}</div>
          <div className="coin-buttons-row">
            <p className="coin-label">Insert Coins:</p>
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
            <div className="wash-buttons-row">
              {washes.map((wash, index) => (
                <div key={index}>
                  <button
                    className="wash-button"
                    onClick={() => handleWashSelection(wash)}
                    disabled={isWashing && !insufficientFunds}
                  >
                    {wash.name}
                    <br />
                    {wash.duration / 60} minutes ${wash.cost.toFixed(2)}
                  </button>
                </div>
              ))}
            </div>
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
        </div>

        <div className="right-column">
          {selectedWash && (
            <div>
              <h4>
                Selected: {selectedWash.name} - {selectedWash.duration / 60}{" "}
                minutes
              </h4>
              <h4
                className={`door-status door-status-${doorStatus.toLowerCase()}`}
              >
                Door Status: {doorStatus}
              </h4>
              {isWashing && (
                <div>
                  <div className="progress-container">
                    <p className="progress-text">
                      Washing Progress: {progress.progressPercentage.toFixed(0)}
                      % <br />
                      Remaining Time: {Math.floor(progress.remainingTime)}{" "}
                      seconds
                    </p>
                    <p></p>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <br />
          <div className="maintenance-container">
            <h2>Maintenance Statistics</h2>
            <p>Total Running Time: {totalTimeSwitchedOn} seconds</p>
            <p>Total Money Earned: ${totalMoneyEarned}</p>
            <button className="reset-button" onClick={handleResetStatistics}>
              Reset Statistics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
