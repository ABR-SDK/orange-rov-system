#!/bin/bash
set -ex
#Install Pre-req
if  ! which gem > /dev/null ; then
    echo "do not exitsts gem"
    exit 1
fi

#gem install fpm


rm -rf node_modules
#Install dependencies
npm install --production

VERSION_NUMBER="`cat package.json | grep version | grep -o '[0-9]*\.[0-9]*\.[0-9]\+'`"
GIT_COMMIT="`git rev-parse --short HEAD`"

if [ "x$GIT_BRANCH" = "x" ]
then
  GIT_BRANCH="`git for-each-ref --format='%(objectname) %(refname:short)' refs/heads | grep $GIT_COMMIT | awk '{print $2}'`"
fi

ARCH=`uname -m`
if [ ${ARCH} = "armv7l" ]
then
  ARCH="armhf"
fi

if [ "$GIT_BRANCH" = "master" ]
then
  PACKAGE_VERSION="$VERSION_NUMBER~~"
else
  PACKAGE_VERSION="$VERSION_NUMBER~~${GIT_BRANCH}."
fi

if [ "x${BUILD_NUMBER}" = "x" ]
then
  PACKAGE_VERSION="${PACKAGE_VERSION}${GIT_COMMIT}"
else
  PACKAGE_VERSION="${PACKAGE_VERSION}${BUILD_NUMBER}.$GIT_COMMIT"
fi

#rm -rf .git

#package
fpm -f -m info@rovhome.com -s dir -t deb -a $ARCH \
	-n orange-cockpit2 \
	-v ${PACKAGE_VERSION} \
  --after-install=./install_lib/openrov-cockpit-afterinstall.sh \
  --before-remove=./install_lib/openrov-cockpit-beforeremove.sh \
  --before-install=./install_lib/openrov-cockpit-beforeinstall.sh \
	--description "Orange Cockpit" \
	.=/opt/orange/cockpit
