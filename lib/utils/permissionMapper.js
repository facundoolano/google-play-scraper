const dict = {
    "en": {
        "retrieve system internal state": "android.permission.DUMP",
        "retrieve running apps": "android.permission.GET_TASKS",
        "read sensitive log data": "android.permission.READ_LOGS",
        "change/intercept network settings and traffic": "android.permission.WRITE_APN_SETTINGS",  // TODO: possibly others?
        "find accounts on the device": "android.permission.GET_ACCOUNTS",
        "read calendar events plus confidential information": "android.permission.READ_CALENDAR",
        "add or modify calendar events and send email to guests without owners' knowledge": "android.permission.WRITE_CALENDAR", 
        "read your contacts": "android.permission.READ_CONTACTS",
        "modify your contacts": "android.permission.WRITE_CONTACTS", 
        "approximate location (network-based)": "android.permission.ACCESS_COARSE_LOCATION",
        "precise location (GPS and network-based)": "android.permission.ACCESS_FINE_LOCATION",
        "access extra location provider commands": "android.permission.ACCESS_LOCATION_EXTRA_COMMANDS",
        "directly call phone numbers": "android.permission.CALL_PHONE",
        "directly call any phone numbers": "android.permission.CALL_PRIVILEGED",
        "modify phone state": "android.permission.MODIFY_PHONE_STATE",
        "erase USB storage": "android.permission.MOUNT_FORMAT_FILESYSTEMS" ,
        "access USB storage filesystem": "android.permission.MOUNT_UNMOUNT_FILESYSTEMS" ,
        "read the contents of your USB storage": "android.permission.READ_EXTERNAL_STORAGE",
        "modify or delete the contents of your USB storage": "android.permission.WRITE_EXTERNAL_STORAGE",
        "take pictures and videos": "android.permission.CAMERA",
        "record audio": "android.permission.RECORD_AUDIO",
        "view Wi-Fi connections": "android.permission.ACCESS_WIFI_STATE",
        "read phone status and identity": "android.permission.READ_PHONE_STATE",
        "body sensors (like heart rate monitors)": "android.permission.BODY_SENSORS",
        "view network connections": "android.permission.ACCESS_NETWORK_STATE",
        "act as the AccountManagerService": "android.permission.ACCOUNT_MANAGER",
        "read battery statistics": "android.permission.BATTERY_STATS",
        "pair with Bluetooth devices": "android.permission.BLUETOOTH_ADMIN",
        "access Bluetooth settings": "android.permission.BLUETOOTH_PRIVILEGED",  // unsure but the other 2 bluetooth permissions are already used
        "send sticky broadcast": "android.permission.BROADCAST_STICKY",
        "change system display settings": "android.permission.CHANGE_CONFIGURATION",
        "change network connectivity": "android.permission.CHANGE_NETWORK_STATE",
        "allow Wi-Fi Multicast reception": "android.permission.CHANGE_WIFI_MULTICAST_STATE",
        "connect and disconnect from Wi-Fi": "android.permission.CHANGE_WIFI_STATE",
        "delete all app cache data": "android.permission.CLEAR_APP_CACHE",
        "disable your screen lock": "android.permission.DISABLE_KEYGUARD",
        "expand/collapse status bar": "android.permission.EXPAND_STATUS_BAR",
        "measure app storage space": "android.permission.GET_PACKAGE_SIZE",
        "full network access": "android.permission.INTERNET",
        "close other apps": "android.permission.RESTART_PACKAGES",
        "change your audio settings": "android.permission.MODIFY_AUDIO_SETTINGS",
        "control Near Field Communication": "android.permission.NFC",
        "make app always run": "android.permission.PERSISTENT_ACTIVITY",
        "read sync settings": "android.permission.READ_SYNC_SETTINGS",
        "run at startup": "android.permission.RECEIVE_BOOT_COMPLETED",
        "reorder running apps": "android.permission.REORDER_TASKS",
        "force background apps to close": "android.permission.KILL_BACKGROUND_PROCESSES",
        "modify global animation speed": "android.permission.SET_ANIMATION_SCALE",
        "enable app debugging": "android.permission.SET_DEBUG_APP",
        "set preferred apps": "android.permission.SET_PREFERRED_APPLICATIONS",
        "limit number of running processes": "android.permission.SET_PROCESS_LIMIT",
        "set time zone": "android.permission.SET_TIME_ZONE",
        "set wallpaper": "android.permission.SET_WALLPAPER",
        "send Linux signals to apps": "android.permission.SIGNAL_PERSISTENT_PROCESSES",
        "draw over other apps": "android.permission.SYSTEM_ALERT_WINDOW",
        "make/receive SIP calls": "android.permission.USE_SIP",
        "control vibration":    "android.permission.VIBRATE",
        "prevent device from sleeping": "android.permission.WAKE_LOCK",
        "modify system settings": "android.permission.WRITE_SETTINGS",
        "toggle sync on and off": "android.permission.WRITE_SYNC_SETTINGS",
        "set an alarm": "com.android.alarm.permission.SET_ALARM",
        "install shortcuts": "com.android.launcher.permission.INSTALL_SHORTCUT",
        "uninstall shortcuts": "com.android.launcher.permission.UNINSTALL_SHORTCUT",
        "access checkin properties": "android.permission.ACCESS_CHECKIN_PROPERTIES",
        "bind to an accessibility service": "android.permission.BIND_ACCESSIBILITY_SERVICE",
        "choose widgets": "android.permission.BIND_APPWIDGET", // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "bind to a condition provider service": "android.permission.BIND_CONDITION_PROVIDER_SERVICE",
        "interact with a device admin": "android.permission.BIND_DEVICE_ADMIN",
        "bind to a dream service": "android.permission.BIND_DREAM_SERVICE",
        "interact with in-call screen": "android.permission.BIND_INCALL_SERVICE",
        "bind to an input method": "android.permission.BIND_INPUT_METHOD",
        "bind to NFC service": "android.permission.BIND_NFC_SERVICE",
        // android.permission.BIND_MIDI_DEVICE_SERVICE is missing. Maybe it's not listed in gplay
        "bind to a notification listener service": "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        "bind to a print service": "android.permission.BIND_PRINT_SERVICE",
        "bind to a widget service": "android.permission.BIND_APPWIDGET",
        "bind to a text service": "android.permission.BIND_TEXT_SERVICE",
        "bind to a TV input": "android.permission.BIND_TV_INPUT",
        // "android.permission.BIND_VISUAL_VOICEMAIL_SERVICE" is missing. Maybe it's not listed in gplay
        "bind to a voice interactor": "android.permission.BIND_VOICE_INTERACTION",
        "bind to a VPN service": "android.permission.BIND_VPN_SERVICE",
        "bind to a wallpaper": "android.permission.BIND_WALLPAPER",
        "allow Bluetooth pairing by Application": "android.permission.BLUETOOTH",
        "send package removed broadcast": "android.permission.BROADCAST_PACKAGE_REMOVED",
        "send SMS-received broadcast": "android.permission.BROADCAST_SMS",
        "send WAP-PUSH-received broadcast": "android.permission.BROADCAST_WAP_PUSH", 
        "capture audio output": "android.permission.CAPTURE_AUDIO_OUTPUT",
        "enable or disable app components": "android.permission.CHANGE_COMPONENT_ENABLED_STATE",
        "control location update notifications": "android.permission.CONTROL_LOCATION_UPDATES",
        "delete other apps' caches": "android.permission.DELETE_CACHE_FILES",
        "delete apps": "android.permission.DELETE_PACKAGES",
        "read/write to resources owned by diag": "android.permission.DIAGNOSTIC",
        "run in factory test mode": "android.permission.FACTORY_TEST",
        "permission to install a location provider": "android.permission.INSTALL_LOCATION_PROVIDER",
        "directly install apps": "android.permission.INSTALL_PACKAGES",
        "manage document storage": "android.permission.MANAGE_DOCUMENTS",
        "reset system to factory defaults": "android.permission.MASTER_CLEAR",
        "control media playback and metadata access": "android.permission.MEDIA_CONTENT_CONTROL",
        "update component usage statistics": "android.permission.PACKAGE_USAGE_STATS",
        "record what you type and actions you take": "android.permission.READ_INPUT_STATE",
        "read sync statistics": "android.permission.READ_SYNC_STATS",
        "force device reboot": "android.permission.REBOOT",
        "send respond-via-message events": "android.permission.SEND_RESPOND_VIA_MESSAGE",
        "set time": "android.permission.SET_TIME",
        "adjust your wallpaper size": "android.permission.SET_WALLPAPER_HINTS",
        "disable or modify status bar": "android.permission.STATUS_BAR",
        "transmit infrared": "android.permission.TRANSMIT_IR",
        // "modify battery statistics":  // This one seems to be some error in translation. See: https://issuetracker.google.com/issues/36922486
        "modify the Google services map": "android.permission.WRITE_GSERVICES",
        "modify secure system settings": "android.permission.WRITE_SECURE_SETTINGS",
        "read voicemail": "com.android.voicemail.permission.READ_VOICEMAIL",
        "write voicemails": "com.android.voicemail.permission.WRITE_VOICEMAIL",
        "add or remove accounts": "android.permission.MANAGE_ACCOUNTS",  // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "read your own contact card": "android.permission.READ_PROFILE", // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "read your text messages (SMS or MMS)": "android.permission.READ_SMS",
        "receive text messages (MMS)": "android.permission.RECEIVE_MMS",
        "receive text messages (SMS)": "android.permission.RECEIVE_SMS",
        "send SMS messages": "android.permission.SEND_SMS",
        "edit your text messages (SMS or MMS)": "android.permission.WRITE_SMS", // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "reroute outgoing calls": "android.permission.PROCESS_OUTGOING_CALLS",
        "read call log": "android.permission.READ_CALL_LOG",
        "write call log": "android.permission.WRITE_CALL_LOG",
        "create accounts and set passwords": "android.permission.AUTHENTICATE_ACCOUNTS",
        "use accounts on the device": "android.permission.USE_CREDENTIALS", // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "read Google service configuration": "com.google.android.providers.gsf.permission.READ_GSERVICES", // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "use any media decoder for playback": "android.permission.ALLOW_ANY_CODEC_FOR_PLAYBACK", // This one is no longer in the android reference. Found here: https://android-permissions.azurewebsites.net/2017/android-permission-ALLOW_ANY_CODEC_FOR_PLAYBACK/
        // "MMS Wakeup": // TODO: unsure
        "receive data from Internet": "com.google.android.c2dm.permission.RECEIVE",
        // This one is no longer in the android reference. Found here: https://www.wandera.com/mobile-security/app-and-data-leaks/app-permissions/
        // The previous permission showed even though it was not on the manifest.
        "receive text messages (WAP)": "android.permission.RECEIVE_WAP_PUSH",
        "download files without notification": "android.permission.DOWNLOAD_WITHOUT_NOTIFICATION",  // This one is no longer in the android reference. Found here: http://androidpermissions.com/
        "full license to interact across users": "android.permission.INTERACT_ACROSS_USERS_FULL",  // This one is no longer in the android reference. Found here: https://stackoverflow.com/a/28134444
    }
};

module.exports = function getPermissionValue(permissionDescription, lang) {
    return dict[lang] ? dict[lang][permissionDescription] || '' : '';
}



