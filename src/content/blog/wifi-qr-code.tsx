import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Open a <Link href="/productivity-tools/qr-code-generator">QR code generator</Link>, choose <strong>Wi-Fi</strong>, enter the network name
      exactly as it appears on your phone, pick the security type (almost always WPA) and type the password. Download the code and test it
      with an iPhone and an Android phone before printing. Guests then point their camera at it and tap to join — no typing.
    </p>
  ),
  intro: (
    <>
      <p>
        Reading out a 16-character router password to every visitor gets old fast. A Wi-Fi QR code fixes that: guests scan it with their
        camera and connect in one tap. Cafés, rentals, offices and anyone with relatives who visit often get a lot out of one.
      </p>
      <p>
        Making the code takes a minute. Making one that works on every phone needs a little more care — most of the “it won&apos;t connect”
        complaints come from the same handful of mistakes.
      </p>
    </>
  ),
  sections: [
    {
      id: "make-one",
      title: "How to make a Wi-Fi QR code",
      body: (
        <>
          <Steps
            items={[
              <>
                Open the <Link href="/productivity-tools/qr-code-generator">QR code generator</Link> and choose <strong>Wi-Fi</strong>.
              </>,
              <>
                Type the <strong>network name (SSID)</strong> exactly — capitals, spaces and symbols included. Copy it from your phone&apos;s
                Wi-Fi list if you&apos;re not sure.
              </>,
              <>
                Choose the security: <strong>WPA/WPA2/WPA3</strong> for nearly every home and office network, <strong>No password</strong> for
                open networks.
              </>,
              <>Type the password, again exactly.</>,
              <>
                If your network doesn&apos;t broadcast its name, turn on <strong>Hidden network</strong>.
              </>,
              <>Download PNG for screens and documents, or SVG for printing at any size.</>,
            ]}
          />
          <ToolCta tool="productivity/qr-code-generator">Make a Wi-Fi QR code that never expires — the details stay on your device.</ToolCta>
          <p>
            The code holds the network details directly. There&apos;s no link to a website and nothing that can expire or be switched off — it
            works for as long as the name and password stay the same.
          </p>
        </>
      ),
    },
    {
      id: "whats-inside",
      title: "What's actually inside the code",
      body: (
        <>
          <p>A Wi-Fi QR code is just a short line of text in a format phones recognize:</p>
          <pre>
            <code>WIFI:T:WPA;S:HomeNetwork;P:correct-horse-42;;</code>
          </pre>
          <DataTable
            caption="Fields in a Wi-Fi QR code"
            head={["Field", "Meaning", "Example"]}
            rows={[
              [<code key="t">T</code>, "Security type", "WPA, WEP or nopass"],
              [<code key="s">S</code>, "Network name (SSID)", "HomeNetwork"],
              [<code key="p">P</code>, "Password", "correct-horse-42"],
              [<code key="h">H</code>, "Hidden network", "true (only when hidden)"],
            ]}
          />
          <p>
            Knowing this helps with troubleshooting: any QR scanner app will show you the text inside a code, so you can check whether the name
            and password in it are right.
          </p>
        </>
      ),
    },
    {
      id: "wont-connect",
      title: "Why a Wi-Fi QR code scans but won't connect",
      body: (
        <>
          <ul>
            <li>
              <strong>A typo in the name or password.</strong> Both are case-sensitive. <code>Home-WiFi</code> and <code>Home-Wifi</code> are
              different networks.
            </li>
            <li>
              <strong>Special characters weren&apos;t escaped.</strong> The format uses <code>;</code>, <code>:</code>, <code>,</code>,{" "}
              <code>&quot;</code> and <code>\</code> as separators, so those characters must be written with a backslash in front. A password
              like <code>pass;word</code> breaks a code made by a careless generator. Ours escapes them automatically.
            </li>
            <li>
              <strong>Hidden network not marked as hidden.</strong> Phones look for the name in the air; if the router doesn&apos;t broadcast it,
              the code needs the hidden flag.
            </li>
            <li>
              <strong>The password changed.</strong> The code stores the old one. Make a new code whenever you change the password.
            </li>
            <li>
              <strong>Work or university networks.</strong> Networks that need a username as well as a password (WPA2-Enterprise, eduroam)
              aren&apos;t supported by the standard Wi-Fi QR format.
            </li>
            <li>
              <strong>WPA3-only networks on older phones.</strong> Most phones join WPA3 networks from a code marked WPA, but some older devices
              can&apos;t use WPA3 at all. Routers in WPA2/WPA3 “transition” mode work with everything.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "phones",
      title: "How guests scan it",
      body: (
        <>
          <DataTable
            caption="Scanning a Wi-Fi QR code"
            head={["Phone", "How"]}
            rows={[
              ["iPhone / iPad", "Open the Camera, point it at the code, tap the “Join network” prompt."],
              ["Android", "Use the camera or Google Lens; on most phones you can also tap the QR icon in Settings → Wi-Fi."],
              ["Laptops", "Most don't scan QR codes — keep the password written below the code for them."],
            ]}
          />
        </>
      ),
    },
    {
      id: "printing",
      title: "Printing it so it scans first time",
      body: (
        <>
          <ul>
            <li>
              <strong>Size:</strong> at least 2.5–3 cm (about an inch) across for scanning up close; bigger if people scan from across a
              counter.
            </li>
            <li>
              <strong>Contrast:</strong> dark code on a light background. Light-on-dark and low-contrast brand colors fail on some phones.
            </li>
            <li>
              <strong>Margin:</strong> keep the white border around the code. Text or decoration touching it causes misreads.
            </li>
            <li>
              <strong>Error correction:</strong> “Medium” is fine for a framed sign. Choose “High” for a sticker that may get scratched.
            </li>
            <li>
              <strong>Use SVG for print</strong> so it stays sharp at any size, and add the network name and password underneath in plain text
              as a fallback.
            </li>
          </ul>
          <Callout type="tip">Test the printed code with both an iPhone and an Android phone before laminating it or ordering a batch.</Callout>
        </>
      ),
    },
    {
      id: "security",
      title: "Is it safe?",
      body: (
        <>
          <p>
            The code isn&apos;t encrypted. Anyone who can photograph it can read the password with any QR app. That&apos;s fine in your living
            room; on a café counter it means the password is effectively public.
          </p>
          <p>
            For anything beyond close friends and family, put the code on a <strong>guest network</strong>. Most routers can create one in a
            few clicks: guests get internet access but can&apos;t see your computers, printers or smart-home devices.
          </p>
          <Callout type="note">
            Our generator builds the code inside your browser, so your Wi-Fi password isn&apos;t sent to a server. That&apos;s worth checking
            with any QR site, since the password is literally what you&apos;re typing in.
          </Callout>
        </>
      ),
    },
  ],
  faqs: [
    { q: "Do Wi-Fi QR codes expire?", a: "No. The network details are stored in the code itself, so it works as long as the network name and password don't change. Dynamic QR services that route through a link can stop working; a Wi-Fi code doesn't use one." },
    { q: "Can I make a Wi-Fi QR code for a hidden network?", a: "Yes — turn on the hidden network option. It adds H:true to the code so phones know to connect even though the network isn't broadcasting its name." },
    { q: "Where do I find my Wi-Fi password?", a: "Often on a sticker on the router. On an iPhone with iOS 16 or later, go to Settings → Wi-Fi, tap the ⓘ next to your network and tap Password. Android phones can show it under Settings → Wi-Fi → your network → Share." },
    { q: "Does it work for WPA3?", a: "Usually yes. Choose WPA — it covers WPA2 and WPA3 personal networks. Some older phones can't join WPA3-only networks at all, with or without a QR code." },
    { q: "Can a Wi-Fi QR code be hacked?", a: "The code itself can't run anything, but anyone who sees it can read the password. Use a guest network for public places, and watch for stickers placed over yours that lead somewhere else." },
  ],
};

export default content;
