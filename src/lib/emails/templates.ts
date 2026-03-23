interface WelcomeEmailProps {
  name: string
  orgName: string
  makerCount: number
  browseUrl: string
}

export function welcomeEmail({ name, orgName, makerCount, browseUrl }: WelcomeEmailProps): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff1e5f; font-size: 28px; margin: 0;">&Dine</h1>
        <p style="color: #888780; font-size: 14px; margin: 4px 0 0; font-style: italic;">Express Card</p>
      </div>
      <h2 style="color: #3F3A37; font-size: 20px;">Welcome${name ? `, ${name}` : ""}!</h2>
      <p style="color: #3F3A37; line-height: 1.6;">
        Your Express Card is ready. You now have access to perks at
        <strong>${makerCount} independent food Makers</strong> near ${orgName}.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${browseUrl}" style="background: #ff1e5f; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
          Browse Makers
        </a>
      </div>
      <p style="color: #888780; font-size: 12px; text-align: center;">
        Visit a maker, tap the NFC tag or enter the PIN, and redeem your daily perk.
      </p>
    </div>
  `
}

interface AlreadyAddedEmailProps {
  loginUrl: string
}

export function alreadyAddedEmail({ loginUrl }: AlreadyAddedEmailProps): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff1e5f; font-size: 28px; margin: 0;">&Dine</h1>
        <p style="color: #888780; font-size: 14px; margin: 4px 0 0; font-style: italic;">Express Card</p>
      </div>
      <h2 style="color: #3F3A37; font-size: 20px;">You&apos;ve been added</h2>
      <p style="color: #3F3A37; line-height: 1.6;">
        Your work email is already linked to an &Dine account. Sign in to access your Express Card.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" style="background: #ff1e5f; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
          Sign in
        </a>
      </div>
    </div>
  `
}

interface WeeklySummaryEmailProps {
  managerName: string
  orgName: string
  weekEnding: string
  totalRedemptions: number
  totalSavings: string
  topMaker: string
  topMakerRedemptions: number
}

export function weeklySummaryEmail({
  managerName,
  orgName,
  weekEnding,
  totalRedemptions,
  totalSavings,
  topMaker,
  topMakerRedemptions,
}: WeeklySummaryEmailProps): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff1e5f; font-size: 28px; margin: 0;">&Dine</h1>
        <p style="color: #888780; font-size: 14px; margin: 4px 0 0;">Weekly Summary</p>
      </div>
      <h2 style="color: #3F3A37; font-size: 20px;">Hi ${managerName},</h2>
      <p style="color: #3F3A37; line-height: 1.6;">
        Here's how ${orgName} used the Express Card this week (ending ${weekEnding}).
      </p>
      <div style="background: #FAF9F7; border: 1px solid #ECEAE7; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <p style="color: #888780; font-size: 12px; margin: 0;">Redemptions</p>
            <p style="color: #ff1e5f; font-size: 24px; font-weight: 600; margin: 4px 0 0;">${totalRedemptions}</p>
          </div>
          <div>
            <p style="color: #888780; font-size: 12px; margin: 0;">Est. savings</p>
            <p style="color: #ff1e5f; font-size: 24px; font-weight: 600; margin: 4px 0 0;">${totalSavings}</p>
          </div>
        </div>
        <p style="color: #3F3A37; font-size: 14px; margin: 0;">
          Most visited: <strong>${topMaker}</strong> (${topMakerRedemptions} visits)
        </p>
      </div>
    </div>
  `
}

interface NewMakerEmailProps {
  makerName: string
  offerTitle: string
  walkMinutes: number
  browseUrl: string
}

export function newMakerEmail({ makerName, offerTitle, walkMinutes, browseUrl }: NewMakerEmailProps): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff1e5f; font-size: 28px; margin: 0;">&Dine</h1>
        <p style="color: #888780; font-size: 14px; margin: 4px 0 0; font-style: italic;">Express Card</p>
      </div>
      <h2 style="color: #3F3A37; font-size: 20px;">New maker nearby</h2>
      <p style="color: #3F3A37; line-height: 1.6;">
        <strong>${makerName}</strong> just joined the Express Card network.
        ${walkMinutes} min walk. ${offerTitle}.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${browseUrl}" style="background: #ff1e5f; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
          View offers
        </a>
      </div>
    </div>
  `
}
