import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACC_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_ID;
const client = twilio(accountSid, authToken);

export const generateOTP = async (phone) => {

    try {
        console.log(phone);

        await client.verify.v2.services(verifySid)
        .verifications.create({ to: '+91' + phone, channel: 'sms' })
        .then((verification) => {
            console.log(verification.status);
            return verification.status;
        });

    } catch (error) {
        return error;
    }
};

export const verifyOTP = async (phone, otp) => {

    try {
        console.log(otp);

        await client.verify.v2.services(verifySid)
        .verificationChecks.create({ to: '+91' + phone, code: otp })
        .then((verification_check) => {
            console.log(verification_check.status);
            if(verification_check.status === 'approved') return true;
            else return false;
        });

    } catch (error) {
        return error;
    }
};