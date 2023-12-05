export function getElapsedTimeString(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
  
    const timeDifference = end - start;
  
    const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeDifference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeDifference % (60 * 60 * 1000)) / (60 * 1000));
  
    let result = "";
  
    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""} `;
    }
  
    if (hours > 0 && days < 1) {
      result += `${hours} hour${hours > 1 ? "s" : ""} `;
    }
  
    if (minutes > 0 && hours < 1) {
      result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
  
    return result.trim();
  }