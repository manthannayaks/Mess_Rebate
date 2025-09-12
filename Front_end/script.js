const perDayRate = 140; // Rebate per absent day

async function showData() {
  const roll = document.getElementById("roll").value.trim();
  const resultDiv = document.getElementById("result");

  if (!roll) {
    resultDiv.innerHTML = `<p style="color:red;">Please enter a roll number.</p>`;
    return;
  }

  try {
    // Use local server URL for development
    console.log(`Fetching data for roll: ${roll}`);
    const response = await fetch(`http://localhost:3001/api/students/${roll}`);
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      resultDiv.innerHTML = `<p style="color:red;">No data found for roll number: ${roll}</p>`;
      return;
    }

    const data = await response.json();
    let tableRows = '';

    // Sort months chronologically
    const monthOrder = ['jun2024', 'jul2024', 'aug2024', 'sep2024', 'oct2024', 'nov2024', 'dec2024'];
    const sortedMonths = monthOrder.filter(month => data.records[month]);

    for (const month of sortedMonths) {
      const record = data.records[month];
      const monthName = month.charAt(0).toUpperCase() + month.slice(1, 3) + ' ' + month.slice(3);
      tableRows += `
        <tr>
          <td>${monthName}</td>
          <td>${record.present}</td>
          <td>${record.absent}</td>
          <td>₹${record.rebate}</td>
        </tr>`;
    }

    resultDiv.innerHTML = `
      <div class="student-info">
        <h2>Student Information</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Roll Number:</strong> ${data.rollNo}</p>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Days Present</th>
              <th>Days Absent</th>
              <th>Rebate (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      <div class="summary">
        <h3>Total Rebate: ₹${data.totalRebate}</h3>
        <p>Rebate rate: ₹${perDayRate} per absent day</p>
      </div>`;
  } catch (err) {
    console.error('Error:', err);
    resultDiv.innerHTML = `<p style="color:red;">Error fetching data: ${err.message}</p>`;
  }
}