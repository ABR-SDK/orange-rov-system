#!/bin/bash
set -x
set -e
rm /etc/init.d/orange

update-rc.d orange remove

cp /etc/rc.local_orig /etc/rc.local
