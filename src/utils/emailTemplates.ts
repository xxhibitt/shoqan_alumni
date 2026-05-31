type EmailTemplateProps = {
  title: string;
  preheader?: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
};

export function generateEmailHTML({
  title,
  preheader = "New notification from Shoqan Alumni",
  content,
  buttonText,
  buttonUrl,
}: EmailTemplateProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f5f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
          
          <!-- Header Area -->
          <tr>
            <td align="center" style="padding: 30px 20px 20px 20px; border-bottom: 1px solid #f0f0f0;">
              <h1 style="margin: 0; color: #10b981; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Shoqan Alumni</h1>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.6;">
              <h2 style="margin-top: 0; margin-bottom: 20px; color: #1e293b; font-size: 20px; font-weight: 600;">${title}</h2>
              
              <div style="margin-bottom: 30px;">
                ${content}
              </div>

              <!-- Action Button -->
              ${buttonText && buttonUrl ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.3s ease;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #f8faf9; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                <strong>Shoqan Alumni Network</strong> &bull; Premium Networking Platform
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
