import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const usePushNotifications = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [vapidPublicKey, setVapidPublicKey] = useState(null);

    useEffect(() => {
        const checkSupport = () => {
            const supported = 'serviceWorker' in navigator && 'PushManager' in window;
            setIsSupported(supported);
            return supported;
        };

        if (checkSupport()) {
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
        setIsSubscribed(!!sub);
    };

    const subscribe = async () => {
        if (!isSupported) {
            console.warn('Push notifications not supported');
            return { success: false, message: 'Not supported' };
        }

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                return { success: false, message: 'Permission denied' };
            }

            // Get VAPID public key from server
            const { data } = await api.get('/auth/profile');

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Subscribe to push
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.vapidPublicKey || import.meta.env.VITE_VAPID_PUBLIC_KEY),
            });

            // Send subscription to server
            await api.post('/notifications/subscribe', pushSubscription);

            setSubscription(pushSubscription);
            setIsSubscribed(true);

            return { success: true, message: 'Subscribed successfully' };
        } catch (error) {
            console.error('Subscribe error:', error);
            return { success: false, message: error.message };
        }
    };

    const unsubscribe = async () => {
        if (!subscription) {
            return { success: true, message: 'Not subscribed' };
        }

        try {
            await subscription.unsubscribe();
            await api.post('/notifications/unsubscribe', {
                endpoint: subscription.endpoint,
            });

            setSubscription(null);
            setIsSubscribed(false);

            return { success: true, message: 'Unsubscribed successfully' };
        } catch (error) {
            console.error('Unsubscribe error:', error);
            return { success: false, message: error.message };
        }
    };

    const sendTestNotification = async () => {
        try {
            await api.post('/notifications/test');
            return { success: true, message: 'Test notification sent' };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send' };
        }
    };

    return {
        isSupported,
        isSubscribed,
        subscription,
        subscribe,
        unsubscribe,
        sendTestNotification,
    };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
