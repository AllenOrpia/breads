
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { usePathname, useRouter } from "next/navigation";

// import { updateUser } from "@/lib/actions/user.actions";
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

import { useOrganization } from "@clerk/nextjs";

interface Props {
  userId: string
}

const PostThread = ({ userId }: Props ) => {
    const router = useRouter();
    const pathname = usePathname();
    const { organization } = useOrganization()
  
    const form = useForm<z.infer<typeof ThreadValidation>>({
      resolver: zodResolver(ThreadValidation),
      defaultValues: {
        thread: '',
        accountId: userId,
      },
    });

    const onSubmit =  async (values: z.infer<typeof ThreadValidation>) => {
        console.log('ORG ID', organization)
        await createThread({
          text: values.thread,
          author: userId,
          communityId: organization ? organization.id : null,
          path: pathname,
        });

        router.push('/')
    }
  return (
    <Form {...form}>
          <form
            className="mt-10 flex flex-col justify-start gap-10"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                rows={15}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
            Post
        </Button>
          </form>
    </Form>
  )
}

export default PostThread