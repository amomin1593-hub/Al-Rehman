export const site = {
  name: "Al-Rehman Traders",
  short: "Al-Rehman",
  tagline: "Sanitary Ware & Bath Fittings",
  description:
    "All types of sanitary ware: sink bowls, kitchen faucets, Muslim showers, accessory sets and bathroom faucets. Gujranwala, Pakistan.",
  phone: "+92 323 8644433",
  phoneRaw: "923238644433",
  // all contact numbers (shown in header, footer and support page)
  phones: [
    { label: "0323 8644433", raw: "923238644433" },
    { label: "0370 6157560", raw: "923706157560" },
  ],
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923238644433",
  email: "zshani534@gmail.com",
  address: "Kangniwala Bypass, Gujranwala, Pakistan",
  hours: "Always open",
  facebook: "https://www.facebook.com/p/Al-Rehman-Traders-100077073488091/",
  freeShippingOver: 25000,
};

export const pkr = (n: number) => "Rs " + n.toLocaleString("en-PK");

export const waLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
