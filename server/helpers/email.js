exports.registerEmailParams = (email, name, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email],
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                        <html>
                            <h1>Hello ${name}</h1>
                            <p>Please verify your email address using this link</p>
                            <a href="${process.env.CLIENT_URL}/auth/activate/${token}">Click to verify</a>
                        </html>
                    `,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Complete registration - TutHunt",
            },
        },
    };
};

exports.forgotPasswordEmailParams = (email, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email],
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                        <html>
                            <h1>Reset Password Link</h1>
                            <p>Please reset your password using this link</p>
                            <a href="${process.env.CLIENT_URL}/auth/password/reset/${token}">Click to reset</a>
                        </html>
                    `,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Reset Password - TutHunt",
            },
        },
    };
};