/**
 * メール通知（Supabaseのメール機能を使用）
 * 本番環境では Resend や SendGrid を推奨
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  content: {
    siteName: string;
    url: string;
    importance: string;
    summary: string;
    intent: string;
    suggestions: string;
  }
) {
  // MVPではコンソールログのみ
  // 本番では Resend API を使用
  console.log('=== Email Notification ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:', content);

  // 実装例（Resend使用時）:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'noreply@competitivewatcher.com',
    to,
    subject,
    html: generateEmailHtml(content),
  });
  */

  return { success: true };
}

/**
 * Slack通知
 */
export async function sendSlackNotification(
  webhookUrl: string,
  content: {
    siteName: string;
    url: string;
    importance: string;
    summary: string;
    intent: string;
    suggestions: string;
  }
) {
  const importanceEmoji = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  const emoji = importanceEmoji[content.importance as keyof typeof importanceEmoji] || '⚪';

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} 競合サイトに変更を検知`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*サイト名:*\n${content.siteName}`,
          },
          {
            type: 'mrkdwn',
            text: `*重要度:*\n${content.importance.toUpperCase()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*変更点:*\n${content.summary}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*マーケ意図:*\n${content.intent}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*推奨施策:*\n${content.suggestions}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'サイトを確認',
              emoji: true,
            },
            url: content.url,
            style: 'primary',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Slack notification error:', error);
    throw error;
  }
}

/**
 * 通知を送信（メールとSlack両方）
 */
export async function notifyChange(
  userEmail: string,
  slackWebhookUrl: string | null,
  content: {
    siteName: string;
    url: string;
    importance: string;
    summary: string;
    intent: string;
    suggestions: string;
  }
) {
  const results = {
    email: false,
    slack: false,
  };

  // メール通知
  try {
    await sendEmailNotification(
      userEmail,
      `[Track On] ${content.siteName}に変更を検知`,
      content
    );
    results.email = true;
  } catch (error) {
    console.error('Email notification failed:', error);
  }

  // Slack通知
  if (slackWebhookUrl) {
    try {
      await sendSlackNotification(slackWebhookUrl, content);
      results.slack = true;
    } catch (error) {
      console.error('Slack notification failed:', error);
    }
  }

  return results;
}

