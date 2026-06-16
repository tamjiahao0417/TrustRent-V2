<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #7c3aed;">Verify Your Email Address</h2>
        
        <p>Hello,</p>
        <p>Welcome to TrustRent! To complete your registration and secure your account, please use the verification code below.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;"><strong>Your Verification Code:</strong></p>
            <p style="margin: 0;">
                <span style="color: #8b5cf6; font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 6px;">{{ $otp }}</span>
            </p>
        </div>

        <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
        
        <p>Thank you for using TrustRent!</p>
    </div>
</body>
</html>