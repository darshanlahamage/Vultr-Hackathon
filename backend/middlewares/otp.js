const otps = new Map();

export const generateOTP = (phone) => {
    const otp = 5555;
    otps.set(phone, otp);
    return otp;
};

export const verifyOTP = (phone, otp) => {
    return otps.get(phone) === otp;
};
