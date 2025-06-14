import { Airport } from "@/types/airport";

// Calculate how many minutes of a flight happened during night
// Night is defined as the time from sunset to sunrise
export async function calculateNightTime(
  flightDate: Date,
  flightStart: string,
  flightEnd: string,
  departureAirport: Airport,
  destinationAirport: Airport
): Promise<number> {
  // Check if we have valid coordinates for both airports
  if (
    departureAirport.lat === null ||
    departureAirport.long === null ||
    destinationAirport.lat === null ||
    destinationAirport.long === null
  ) {
    console.warn("Missing coordinates for one or both airports");
    return 0;
  }
  // Get sunrise/sunset times for both departure and destination airports
  console.log("Getting sun times for airports:", {
    departure: {
      lat: departureAirport.lat,
      long: departureAirport.long,
    },
    destination: {
      lat: destinationAirport.lat,
      long: destinationAirport.long,
    },
    date: flightDate.toISOString(),
  });

  const [depTimes, destTimes] = await Promise.all([
    getSunTimes(departureAirport.lat, departureAirport.long, flightDate),
    getSunTimes(destinationAirport.lat, destinationAirport.long, flightDate),
  ]);

  console.log("Received sun times:", {
    departure: depTimes,
    destination: destTimes,
  });

  if (!depTimes || !destTimes) {
    console.log("Missing sun times, returning 0");
    return 0;
  }
  // Convert flight times to Date objects
  const [startHours, startMinutes] = flightStart.split(":").map(Number);
  const [endHours, endMinutes] = flightEnd.split(":").map(Number);

  console.log("Flight time components:", {
    startHours,
    startMinutes,
    endHours,
    endMinutes,
    flightStartString: flightStart,
    flightEndString: flightEnd,
  });

  const flightStartTime = new Date(flightDate);
  flightStartTime.setUTCHours(startHours, startMinutes, 0, 0);

  const flightEndTime = new Date(flightDate);
  flightEndTime.setUTCHours(endHours, endMinutes, 0, 0);

  console.log("Flight times:", {
    startTime: flightStartTime.toISOString(),
    endTime: flightEndTime.toISOString(),
    originalDate: flightDate.toISOString(),
  });

  // Handle flight spanning midnight
  if (flightEndTime < flightStartTime) {
    console.log("Flight spans midnight, adjusting end time");
    flightEndTime.setDate(flightEndTime.getDate() + 1);
  }

  // Get sunset/sunrise times for interpolation
  const depSunset = new Date(depTimes.sunset);
  const depSunrise = new Date(depTimes.sunrise);
  const destSunset = new Date(destTimes.sunset);
  const destSunrise = new Date(destTimes.sunrise);

  // Interpolate sunset/sunrise times based on flight progress
  const totalFlightMinutes =
    (flightEndTime.getTime() - flightStartTime.getTime()) / (60 * 1000);
  let nightMinutes = 0;

  // Check each minute of the flight
  for (let minute = 0; minute <= totalFlightMinutes; minute++) {
    const currentTime = new Date(
      flightStartTime.getTime() + minute * 60 * 1000
    );

    // Calculate flight progress (0 to 1)
    const progress = minute / totalFlightMinutes;

    // Interpolate sunset/sunrise times based on current position
    const currentSunset = new Date(
      depSunset.getTime() * (1 - progress) + destSunset.getTime() * progress
    );
    const currentSunrise = new Date(
      depSunrise.getTime() * (1 - progress) + destSunrise.getTime() * progress
    );

    // Check if current time is during night
    if (currentTime > currentSunset || currentTime < currentSunrise) {
      nightMinutes++;
    }
  }

  return nightMinutes;
}

async function getSunTimes(
  lat: number | null,
  long: number | null,
  date: Date
): Promise<{ sunrise: string; sunset: string } | null> {
  if (lat === null || long === null) {
    return null;
  }

  const formattedDate = date.toISOString().split("T")[0];
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&date=${formattedDate}&formatted=0`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sun times: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error("Invalid response from sunrise-sunset API");
    }

    return {
      sunrise: data.results.sunrise,
      sunset: data.results.sunset,
    };
  } catch (err) {
    console.error("Error fetching sun times:", err);
    return null;
  }
}
