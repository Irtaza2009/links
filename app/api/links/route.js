import { NextResponse } from "next/server";
import { createLink, listLinks, deleteLink } from "../../../lib/store";

export async function GET() {
  const links = await listLinks();
  return NextResponse.json({ links });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const record = await createLink(body);
    return NextResponse.json({ link: record });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  await deleteLink(slug);
  return NextResponse.json({ ok: true });
}
