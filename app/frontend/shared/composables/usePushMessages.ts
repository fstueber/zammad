// Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/
import {
  useNotifications,
  NotificationTypes,
} from '@shared/components/CommonNotifications'
import { usePushMessagesSubscription } from '@shared/graphql/subscriptions/pushMessages.api'
import {
  PushMessagesSubscription,
  PushMessagesSubscriptionVariables,
} from '@shared/graphql/types'
import { SubscriptionHandler } from '@shared/server/apollo/handler'
import testFlags from '@shared/utils/testFlags'
import { onMounted } from 'vue'

let subscription: SubscriptionHandler<
  PushMessagesSubscription,
  PushMessagesSubscriptionVariables
>

export default function usePushMessages() {
  function notify(message: string) {
    useNotifications().notify({
      message,
      type: NotificationTypes.WARN,
      persistent: true,
    })
  }

  onMounted(() => {
    if (subscription) return

    subscription = new SubscriptionHandler(usePushMessagesSubscription())
    subscription.onResult((result) => {
      const message = result.data?.pushMessages
      if (!message?.title && !message?.text) {
        testFlags.set('usePushMessagesSubscription.subscribed')
        return
      }
      notify(`${message.title}: ${message.text}`)
    })
  })
}