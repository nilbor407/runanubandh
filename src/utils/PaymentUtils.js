const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWTScreatKey } = require('../common/Constants');

/**
 * Utility function to save payment information consistently
 * @param {String} userId - User ID
 * @param {Object} paymentInfo - Payment information object
 * @param {String} method - Payment method ('phonepe' or 'razorpay')
 * @param {String} orderId - Optional order ID for Razorpay
 * @returns {Promise} - Promise resolving to updated user data
 */
const savePaymentInfo = async (userId, paymentInfo, method, orderId = null) => {
    try {
        console.log(`💳 Saving payment info for user ${userId} using ${method}`);
        console.log('💳 Payment data:', JSON.stringify(paymentInfo, null, 2));

        // Generate JWT token
        const jwtData = {
            userId,
            time: Date(),
        };
        const token = jwt.sign(jwtData, JWTScreatKey);

        // Structure payment info consistently
        const structuredPaymentInfo = {
            ...paymentInfo,
            timestamp: new Date().toISOString(),
            method: method,
            status: getPaymentStatus(paymentInfo, method),
            savedAt: new Date().toISOString()
        };

        // Prepare update data
        const updateData = {
            paymentInfo: structuredPaymentInfo,
            token,
            lastPaymentUpdate: new Date().toISOString()
        };

        // Update subscription dates if payment is successful
        if (structuredPaymentInfo.status === 'succeeded') {
            updateData.subscriptionStartDate = new Date().toISOString();
            updateData.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            console.log('💳 Payment successful - updating subscription dates');
        }

        // Choose the appropriate query based on method
        let query;
        if (method === 'razorpay' && orderId) {
            query = { 'orderInfo.orderId': orderId };
        } else {
            query = { _id: userId };
        }

        console.log('💳 Update query:', query);
        console.log('💳 Update data keys:', Object.keys(updateData));

        // Perform the update
        const updatedUser = await User.findOneAndUpdate(
            query,
            updateData,
            {
                new: true,
                runValidators: true,
                upsert: false // Don't create if not found
            }
        );

        if (!updatedUser) {
            throw new Error(`User not found for payment update. Query: ${JSON.stringify(query)}`);
        }

        console.log('✅ Payment info saved successfully for user:', updatedUser._id);
        console.log('✅ Payment method:', updatedUser.paymentInfo?.method);
        console.log('✅ Payment status:', updatedUser.paymentInfo?.status);

        // Verify the save by checking if paymentInfo exists
        if (!updatedUser.paymentInfo) {
            throw new Error('Payment info was not saved properly - field is empty after update');
        }

        return updatedUser;

    } catch (error) {
        console.error('❌ Error in savePaymentInfo:', error);
        throw error;
    }
};

/**
 * Determine payment status based on payment info and method
 * @param {Object} paymentInfo - Payment information
 * @param {String} method - Payment method
 * @returns {String} - Payment status
 */
const getPaymentStatus = (paymentInfo, method) => {
    if (method === 'phonepe') {
        return paymentInfo.code === 'PAYMENT_SUCCESS' ? 'succeeded' : 'failed';
    } else if (method === 'razorpay') {
        return paymentInfo.status || 'unknown';
    }
    return 'unknown';
};

/**
 * Verify payment info exists for a user
 * @param {String} userId - User ID
 * @returns {Promise} - Promise resolving to payment verification result
 */
const verifyPaymentInfo = async (userId) => {
    try {
        const user = await User.findById(userId).select('paymentInfo orderInfo subscriptionStartDate subscriptionEndDate');

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        return {
            success: true,
            hasPaymentInfo: !!user.paymentInfo,
            paymentMethod: user.paymentInfo?.method,
            paymentStatus: user.paymentInfo?.status,
            subscriptionStartDate: user.subscriptionStartDate,
            subscriptionEndDate: user.subscriptionEndDate,
            lastPaymentUpdate: user.paymentInfo?.savedAt
        };

    } catch (error) {
        console.error('Error verifying payment info:', error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    savePaymentInfo,
    verifyPaymentInfo,
    getPaymentStatus
};
