const numberWithCommas  = require("../utils/numberWithComa");
const catchAsyncError = require('../middleware/catchAsyncError');
const clientData = require('../utils/data/seedData')

exports.getCreditScore = catchAsyncError(async(req,res,next)=>{
    const { amount, } = req.body;
// Loan Qualification Algorithm
function calculateCreditScore({ accountHistory, savings, earnings, assets, paymentHistory, creditLength, recentCreditHistory, hasOutstandingLoan }) {
    let score = 0;

    // Account history, savings, and assets (35% of score)
    score += Math.min((accountHistory + savings + assets) / 1000, 350);

    // Payment history (30% of score) - Good payment history adds to the score
    score += paymentHistory === 'good' ? 300 : paymentHistory === 'average' ? 200 : 100;

    // Length of credit history (15% of score)
    score += Math.min(creditLength * 10, 150);

    // Recent credit history (10% of score) - no recent large loans or credit applications is ideal
    score += recentCreditHistory === 'none' ? 100 : recentCreditHistory === 'small' ? 50 : 0;

    // Outstanding loan status (10% of score) - deduct points for outstanding loans
    score += hasOutstandingLoan ? 0 : 100;

    // Cap the score at 1000
    return Math.min(score, 1000);
}

// Recommend loan amount based on credit score
function recommendLoanAmount(creditScore, requestedAmount) {
    const maxEligibleAmount = requestedAmount * (creditScore / 1000);
    return {
        isEligible: creditScore >= 600,
        msg: creditScore >= 600 ? "Greate news you are eligible for loan" : "Ooops sorry you are not eligible tfor loan at this time" ,
        recommendedAmount: maxEligibleAmount.toFixed(2),
        // creditScore
    };
}

// Main function to determine loan qualification
 function evaluateLoanQualification(clientData, requestedAmount) {
    const creditScore = calculateCreditScore(clientData);
    const recommendation = recommendLoanAmount(creditScore, requestedAmount);

    if (recommendation.isEligible) {
        console.log(`Client qualifies for a loan up to: Ugx ${numberWithCommas(recommendation.recommendedAmount)}`);
    } else {
        console.log(`Client does not qualify for the requested loan amount.`);
        console.log(`Recommended maximum loan based on score: Ugx ${numberWithCommas(recommendation.recommendedAmount)}`);
    }

    return recommendation;
}
// const requestedAmount = 100000;

const result = evaluateLoanQualification(clientData, amount);

res.status(200).json({
    success: true,
    // message: `Email sent to: ${user.email}`,
    result
  });
})
