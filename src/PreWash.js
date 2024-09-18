export const insertCoin = (amount, totalAmount) => {
  return totalAmount + amount;
};

export const selectWash = (wash, totalAmount, setMessage, setSelectedWash) => {
  console.log("selectWash - wash:", wash);
  console.log("selectWash - totalAmount:", totalAmount);

  // No money inserted
  if (totalAmount === 0) {
    return -1;
  }

  if (totalAmount >= wash.cost) {
    setSelectedWash(wash);

    // Refund excess money if the user overpaid
    const excess = parseFloat((totalAmount - wash.cost).toFixed(1));
    if (excess > 0) {
      setMessage(
        `Success! ${wash.name} started. Refunded: $${excess.toFixed(2)}`
      );
    } else {
      setMessage(`Success! ${wash.name} started.`);
    }

    // Reset the totalAmount to 0 after the wash starts
    return 0;
  } else {
    // Insufficient amount
    setMessage(
      `Insufficient amount. Please insert $${(wash.cost - totalAmount).toFixed(
        2
      )} more.`
    );
    return totalAmount;
  }
};

export const cancelWash = (totalAmount, setMessage, setSelectedWash) => {
  setSelectedWash(null);
  setMessage(`Cancelled. Refunded: $${totalAmount.toFixed(2)}`);

  // Reset the totalAmount to 0 after cancelling
  return 0;
};
