#!/usr/bin/perl 

use Net::SNMP; 

# requires a hostname and a community string as its arguments
($session,$error) = Net::SNMP->session(Hostname => $ARGV[0],
                                       Community => $ARGV[1]);

die "session error: $error" unless ($session);

# iso.org.dod.internet.mgmt.mib-2.interfaces.ifNumber.0 = 
#   1.3.6.1.2.1.2.1.0
$result = $session->get_request("1.3.6.1.2.1.2.1.0");

die "request error: ".$session->error unless (defined $result);

$session->close;

print "Number of interfaces: ".$result->{"1.3.6.1.2.1.2.1.0"}."\n";
