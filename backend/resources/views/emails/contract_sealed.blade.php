<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #7c3aed;">Tenancy Agreement Sealed</h2>
        
        <p>Hello,</p>
        <p>Great news! The tenancy agreement for <strong>{{ $contract->property->title ?? 'the property' }}</strong> has been officially sealed on the Ethereum blockchain.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Contract ID:</strong> #{{ $contract->id }}</p>
            <p style="margin: 0; word-break: break-all;">
                <strong>Blockchain Transaction Hash:</strong><br>
                <span style="color: #8b5cf6; font-family: monospace; font-size: 13px;">{{ $contract->blockchain_hash }}</span>
            </p>
        </div>

        <p>This hash acts as a permanent, immutable digital fingerprint of your contract. You can use it in your dashboard to verify the integrity of your agreement at any time.</p>
        
        <p>Thank you for using TrustRent!</p>
    </div>
</body>
</html>