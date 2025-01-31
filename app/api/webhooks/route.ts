
import {
  addMemberToCommunity,
  createCommunity,
  deleteCommunity,
  removeUserFromCommunity,
  updateCommunityInfo,
} from "@/lib/actions/community.actions";

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";


export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.NEXT_CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt?.data;
  const eventType = evt?.type;


  // Listen organization creation event
  if (eventType === "organization.created") {
   
    const { id, name, slug, image_url, created_by } =
      evt?.data ?? {};

    try {
      await createCommunity({
        id: id,
        name: name, 
        username: slug,
        image: image_url || '',
        bio: 'org bio',
        createdById: created_by || ''
      });

      return new Response( "User Created", { status: 201 });
    } catch (err: any) {
      console.log(err);
      return new Response(
        `Error: ${err.message}`,
        { status: 500 }
      );
    }
  }

  // Listen organization invitation creation event.
  // Just to show. You can avoid this or tell people that we can create a new mongoose action and
  // add pending invites in the database.
  if (eventType === "organizationInvitation.created") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Invitations#operation/CreateOrganizationInvitation
      console.log("Invitation created", evt?.data);

      return new Response(
        'Invitation Created',
        { status: 201 }
      );
    } catch (err: any) {

      return new Response(
          `Error: $${err.message}`,
        { status: 500 }
      );
    }
  }

  // Listen organization membership (member invite & accepted) creation
  if (eventType === "organizationMembership.created") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/CreateOrganizationMembership
      // Show what evnt?.data sends from above resource
      const { organization, public_user_data } = evt?.data;
      console.log("created", evt?.data);

      // @ts-ignore
      await addMemberToCommunity(organization.id, public_user_data.user_id);

      return new Response(
          'Invitation Accepted',
        { status: 201 }
      );
    } catch (err: any) {
      console.log(err);

      return new Response(
        `Error: ${err.message}`,
        { status: 500 }
      );
    }
  }

  // Listen member deletion event
  if (eventType === "organizationMembership.deleted") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/DeleteOrganizationMembership
      // Show what evnt?.data sends from above resource
      const { organization, public_user_data } = evt?.data;
      console.log("removed", evt?.data);

      // @ts-ignore
      await removeUserFromCommunity(public_user_data.user_id, organization.id);

      return new Response('Member Removed', { status: 201 });
    } catch (err: any) {
      console.log(err);

      return new Response(
        `Error: ${err.message}`,
        { status: 500 }
      );
    }
  }

  // Listen organization updation event
  if (eventType === "organization.updated") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/UpdateOrganization
      // Show what evnt?.data sends from above resource
      const { id, image_url, name, slug } = evt?.data;
      console.log("updated", evt?.data);

      // @ts-ignore
      await updateCommunityInfo(id, name, slug, logo_url);

      return new Response('Member Removed', { status: 201 });
    } catch (err: any) {
      console.log(err);

      return new Response(
       `Error: ${err.message}`,
        { status: 500 }
      );
    }
  }

  // Listen organization deletion event
  if (eventType === "organization.deleted") {
    try {
      // Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/DeleteOrganization
      // Show what evnt?.data sends from above resource
      const { id } = evt?.data;
      console.log("deleted", evt?.data);

      // @ts-ignore
      await deleteCommunity(id);

      return new Response(
        'Organization Deleted',
        { status: 201 }
      );
    } catch (err: any) {
      console.log(err);

      return new Response(
       `Error: ${err.message}`,
        { status: 500 }
      );
    }
  }
};