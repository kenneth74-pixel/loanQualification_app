const numberWithCommas = require("../utils/numberWithComa");
const catchAsyncError = require('../middleware/catchAsyncError');
const clientData = require('../utils/data/seedData');

const ErrorHandler = require("../utils/errorHandler");
const hasNegativeIntegers = require('../utils/negativeHandler');
const isRequestBodyEmpty = require('../utils/requestHandler');
const booleanOnly = require('../utils/booleanHandler');
const stringsOnly = require('../utils/stringHandler');


// To Do 
// Move to redis server or db
let tempData = {};


// Collect Scoring Data
exports.createCreditScore = catchAsyncError(async (req, res, next) => {

    if (isRequestBodyEmpty(req)) {
        return next(new ErrorHandler("Bad Request", 400));
    }

    const {
        id,
        monthlyEarning,
        savings,
        assetValue,
        paymentHistory,
        creditLength,
        creditHistory,
        outStandingLoan
    } = req.body;


    if (hasNegativeIntegers(monthlyEarning)) {
        return next(new ErrorHandler("monthly earning has to be valid integer.", 400));
    }
    if (hasNegativeIntegers(savings)) {
        return next(new ErrorHandler("saving amount has to be valid integer.", 400));
    }
    if (hasNegativeIntegers(assetValue)) {
        return next(new ErrorHandler("assets value has to be valid integer.", 400));
    }
    if (hasNegativeIntegers(creditLength)) {
        return next(new ErrorHandler("credit length has to be valid integer.", 400));
    }
    if (stringsOnly(paymentHistory)) {
        return next(new ErrorHandler("payment history has to be valid string.", 400));
    }
    if (stringsOnly(creditHistory)) {
        return next(new ErrorHandler("ctedit history has to be valid string.", 400));
    }

    let booleanValue;

    if (outStandingLoan == 'yes') {
        booleanValue = true;
    } else {
        booleanValue = false
    }

    let clientData = {
        "accountHistory": monthlyEarning,
        "savings": savings,
        "assets": assetValue,
        "paymentHistory": paymentHistory,
        "creditLength": creditLength,       // in years
        "recentCreditHistory": creditHistory,
        "hasOutstandingLoan": booleanValue
    }

    tempData = clientData;
    res.status(200).json({
        success: true,
        tempData
    });
});


// Handle Scoring
let saving;
let asset;
let accountBal;

exports.getCreditScore = catchAsyncError(async (req, res, next) => {

    // Loan Qualification Algorithm
    function calculateCreditScore({ accountHistory, savings, assets, paymentHistory, creditLength, recentCreditHistory, hasOutstandingLoan }) {
        let score = 0;
        saving = savings;
        asset = assets;
        accountBal = accountHistory;


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
        const totalSum = saving + asset + accountBal;

        const maxAllowedLoan = totalSum / 2;

        const maxEligibleAmount = (maxAllowedLoan * (creditScore / 1000));

        let eligibleAmount = Math.min(maxEligibleAmount, maxAllowedLoan);

        const message = creditScore >= 600
            ? (requestedAmount <= eligibleAmount
                ? `Congrats! You qualify for UGX ${numberWithCommas(requestedAmount)}.`
                : `Oops, sorry, you do not qualify for UGX ${numberWithCommas(requestedAmount)}.`)
            : "Oops, sorry, you are not eligible for a loan at this time.";

        return {
            isEligible: creditScore >= 600 && requestedAmount <= eligibleAmount,
            msg: message,
            recommendedAmount: creditScore >= 600 ? eligibleAmount.toFixed(2) : 0,
            creditScore
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

    // Handling Requests
    if (isRequestBodyEmpty(req)) {
        return next(new ErrorHandler("Bad Request", 400));
    }

    const { amount } = req.body;

    let loanRequestAmount;
    if (hasNegativeIntegers(amount)) {
        return next(new ErrorHandler("amount' has to be valid integer.", 400));
    }
    loanRequestAmount = amount;


    const result = evaluateLoanQualification(tempData, loanRequestAmount);

    res.status(200).json({
        success: true,
        result
    });

})
