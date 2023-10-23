export function convertTo12HourFormat(inputTime) {
  if (inputTime) {
    // Extract hours, minutes, and seconds
    const timePart = inputTime.split(" ")[0]; // Extracts "14:56:22"
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Determine if it's AM or PM
    const amOrPm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    const twelveHourFormat = hours % 12 || 12;

    // Format the output
    const outputTime = `${twelveHourFormat}:${
      minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds} ${amOrPm}`;
    return outputTime;
  } else {
    return;
  }
}
