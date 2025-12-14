import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-url";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const connectionId = searchParams.get("connection_id");

  // Decode state to get condominiumId
  let condominiumId = "";
  let tenantId = "";
  
  try {
    if (state) {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      condominiumId = stateData.condominiumId;
      tenantId = stateData.tenantId;
    }
  } catch {
    // Invalid state
    return new NextResponse(
      generateHtmlResponse("error", "Paramètres invalides", condominiumId),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (error) {
    return new NextResponse(
      generateHtmlResponse("error", errorDescription || error, condominiumId),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new NextResponse(
      generateHtmlResponse("error", "Code d'autorisation manquant", condominiumId),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // Get the access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // Call backend to exchange code and store connection
    const response = await fetch(
      `${API_URL}/bank/connect/finalize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          code,
          state,
          connectionId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new NextResponse(
        generateHtmlResponse("error", errorData.message || "Erreur lors de la connexion", condominiumId),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return new NextResponse(
      generateHtmlResponse("success", "Compte bancaire connecté avec succès !", condominiumId),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("Callback error:", err);
    return new NextResponse(
      generateHtmlResponse("error", "Erreur serveur", condominiumId),
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

function generateHtmlResponse(status: "success" | "error", message: string, condominiumId: string): string {
  const isSuccess = status === "success";
  const redirectUrl = condominiumId 
    ? `/app/condominiums/${condominiumId}/bank?${status}=true`
    : "/app";
    
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "Connexion réussie" : "Erreur"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a0a0a;
      color: #fafafa;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .icon.success { background: rgba(34, 197, 94, 0.1); }
    .icon.error { background: rgba(239, 68, 68, 0.1); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; margin-bottom: 1.5rem; }
    .message {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
    .message.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .message.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    button {
      background: #f59e0b;
      color: #0a0a0a;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: #d97706; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${status}">
      ${isSuccess ? "✓" : "✕"}
    </div>
    <h1>${isSuccess ? "Connexion réussie !" : "Une erreur est survenue"}</h1>
    <p>${message}</p>
    <button onclick="handleClose()">
      ${isSuccess ? "Continuer" : "Réessayer"}
    </button>
  </div>
  <script>
    function handleClose() {
      // Try to communicate with parent window (iframe mode)
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'powens-callback', 
          status: '${status}',
          condominiumId: '${condominiumId}'
        }, '*');
      } else {
        // Direct navigation
        window.location.href = '${redirectUrl}';
      }
    }
    
    // Auto-notify parent after 2 seconds
    setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'powens-callback', 
          status: '${status}',
          condominiumId: '${condominiumId}'
        }, '*');
      }
    }, 2000);
  </script>
</body>
</html>
  `;
}
