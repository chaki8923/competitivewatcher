import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFeedbackNotification(feedback: {
  title: string;
  description: string;
  userEmail: string;
  createdAt: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.DEVELOPER_EMAIL) {
    console.warn('⚠️ メール送信設定が不完全です。FEEDBACK_EMAIL_SETUP.mdを確認してください。');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.DEVELOPER_EMAIL!,
      subject: `[Track On] 新しいフィードバック: ${feedback.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .label { font-weight: bold; color: #6b7280; margin-top: 20px; margin-bottom: 8px; }
              .value { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
              .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 新しいフィードバック</h1>
              </div>
              <div class="content">
                <div class="label">📝 タイトル</div>
                <div class="value">${feedback.title}</div>
                
                <div class="label">💬 内容</div>
                <div class="value" style="white-space: pre-wrap;">${feedback.description}</div>
                
                <div class="label">👤 投稿者</div>
                <div class="value">${feedback.userEmail}</div>
                
                <div class="label">📅 投稿日時</div>
                <div class="value">${new Date(feedback.createdAt).toLocaleString('ja-JP')}</div>
                
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
                  ダッシュボードで確認
                </a>
              </div>
              <div class="footer">
                <p>Track On - 競合サイト監視SaaS</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ メール送信エラー:', error);
      return;
    }

    console.log('✅ フィードバック通知メール送信成功:', data?.id);
  } catch (error) {
    console.error('❌ メール送信エラー:', error);
  }
}
