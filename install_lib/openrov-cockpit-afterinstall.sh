#!/bin/bash
set -x
set -e

# compile the device tree files
#/opt/orange/cockpit/linux/update-devicetree-oberlays.sh

# set the orange startup
ln -s /opt/orange/cockpit/linux/orange.service /etc/init.d/orange
chmod +x /opt/orange/cockpit/linux/orange.service
update-rc.d orange defaults

chmod +x /opt/orange/cockpit/linux/rc.local

chown -R orange /opt/orange/cockpit
chgrp -R admin /opt/orange/cockpit

# setup reset and uart for non black BB
cp /etc/rc.local /etc/rc.local_orig
cat > /etc/rc.local << __EOF__
#!/bin/bash -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#

/opt/orange/cockpit/linux/rc.local

exit 0

__EOF__
