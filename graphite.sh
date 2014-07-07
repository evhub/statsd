#!/usr/bin/env bash

echo export PATH='/usr/local/bin:${PATH}' >> ~/.bash_profile
echo export PYTHONPATH="/opt/graphite/webapp/:${PYTHONPATH}" >> ~/.bash_profile
echo export PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig >> ~/.bash_profile

xcode-select --install

ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

brew install cairo && brew link cairo
brew install py2cairo && brew link py2cairo

cd ~/Checkout/

git clone https://github.com/graphite-project/whisper.git
pushd whisper
sudo python setup.py install
popd

git clone https://github.com/graphite-project/carbon.git
pushd carbon
sudo python setup.py install
popd

pushd /opt/graphite/conf
sudo cp carbon.conf.example carbon.conf
sudo cp storage-schemas.conf.example storage-schemas.conf
popd

git clone https://github.com/graphite-project/graphite-web.git
pushd graphite-web
pip install -r requirements.txtp
python check-dependencies.py
sudo python setup.py install
popd

pushd /opt/graphite/webapp/graphite
sudo cp local_settings.py.example local_settings.py
popd

cd /opt/graphite
sudo chown -R $USER: /opt/graphite
export DJANGO_SETTINGS_MODULE=graphite.settings
python /Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages/django/bin/django-admin.py syncdb
sudo python bin/carbon-cache.py start
sudo python bin/run-graphite-devel-server.py ./
