// Get DOM elements
const reconstructButton = document.getElementById("reconstructButton");
const jsonInputField = document.getElementById("jsonInput");
const outputShares = document.getElementById("shares");
const outputPolynomial = document.getElementById("polynomial");
const outputConstant = document.getElementById("constant");

/**
 * Convert a number from a given base to decimal.
 */
function convertToDecimal(valueStr, base) {
  return parseInt(valueStr, base);
}

/**
 * Parse the JSON input and extract shares.
 */
function parseJsonInput(jsonInput) {
  const data = JSON.parse(jsonInput);
  const { n, k } = data.keys;

  const shares = {};
  for (const key in data) {
    if (key === "keys") continue;
    const x = parseInt(key, 10);
    const base = parseInt(data[key].base, 10);
    const y = convertToDecimal(data[key].value, base);
    shares[x] = y;
  }

  return { n, k, shares };
}

/**
 * Select the first k shares for reconstruction.
 */
function selectShares(shares, k) {
  const sortedKeys = Object.keys(shares)
    .map(Number)
    .sort((a, b) => a - b);
  const selected = {};
  for (let i = 0; i < k; i++) {
    const key = sortedKeys[i];
    selected[key] = shares[key];
  }
  return selected;
}

/**
 * Reconstruct the polynomial and return its coefficients.
 */
function reconstructPolynomial(selectedShares) {
  const xs = [];
  const ys = [];
  for (const [x, y] of Object.entries(selectedShares)) {
    xs.push(Number(x));
    ys.push(Number(y));
  }

  // Construct the Vandermonde matrix
  const A = xs.map((x) => {
    const row = [];
    for (let i = xs.length - 1; i >= 0; i--) {
      row.push(Math.pow(x, i));
    }
    return row;
  });

  // Solve the system A * coeffs = ys
  const coeffsMatrix = math.lusolve(A, ys);
  return coeffsMatrix.map((row) => row[0]);
}

/**
 * Extract the constant term from the polynomial coefficients.
 */
function findConstantTerm(coeffs) {
  return coeffs[coeffs.length - 1];
}

/**
 * Main function to handle the reconstruction process.
 */
function reconstruct() {
  const jsonInput = jsonInputField.value;

  try {
    // Step 1: Parse the JSON input
    const { n, k, shares } = parseJsonInput(jsonInput);

    // Step 2: Display Converted Shares
    let sharesText = "Converted Shares:<br>";
    for (const [x, y] of Object.entries(shares)) {
      sharesText += `Share ${x}: (x=${x}, y=${y})<br>`;
    }
    outputShares.innerHTML = sharesText;

    // Step 3: Select k shares for reconstruction
    const selectedShares = selectShares(shares, k);
    let selectedText = `Selected ${k} Shares for Reconstruction:<br>`;
    for (const [x, y] of Object.entries(selectedShares)) {
      selectedText += `(x=${x}, y=${y})<br>`;
    }
    outputShares.innerHTML += selectedText;

    // Step 4: Reconstruct the polynomial
    const coeffs = reconstructPolynomial(selectedShares);
    const constantTerm = findConstantTerm(coeffs);

    // Display the polynomial
    const polynomialTerms = [];
    for (let i = 0; i < coeffs.length - 1; i++) {
      const currentDegree = coeffs.length - 1 - i;
      const coeff = coeffs[i];
      if (coeff !== 0) {
        polynomialTerms.push(
          currentDegree !== 0 ? `${coeff}x^${currentDegree}` : `${coeff}`
        );
      }
    }
    polynomialTerms.push(`${constantTerm}`);
    const polynomial = polynomialTerms.join(" + ");
    outputPolynomial.innerHTML = `Reconstructed Polynomial: f(x) = ${polynomial}`;

    // Step 5: Output the constant term
    outputConstant.innerHTML = `The constant term (c) of the polynomial is: ${constantTerm}`;
  } catch (error) {
    alert("Invalid JSON input.");
    console.error(error);
  }
}

reconstructButton.addEventListener("click", reconstruct);
