#!/usr/bin/perl 

use CGI; 
use JSON; 
use Data::Dumper; 

use strict;
use warnings;

use CGI qw(:standard);
use Net::SNMP; 

my $query = CGI->new();
my @names = $query->param;

foreach my $name ( @names ) { 
	if ( $name =~ /\_/ ) { 
		next; 
	} 
	else { print "
		".$name."\t=\t".$query->param($name) . "

			\n"; 
	}
} 


my $OID = ("1.3.6.1.4.1.9.9.513");

my ($session, $error) = Net::SNMP->session(
		-hostname => 'localhost',
		-version => 'snmpv2c',
		-community => 'public'
		);

if (!defined $session) {
	printf "ERROR: %s.\n", $error;
	exit 1;
}


my $result = $session->get_request(-varbindlist => [ $OID ],);


if (!defined $result) {
	printf "ERROR: %s.\n", $session->error();
	$session->close();
	exit 1;
}

my $q = new CGI;
my $in = $q->Vars;
my $string = Dumper ($in);

foreach my $key ( sort keys %$result ) {
	print "$key => $$result{$key}\n";
}

$session->close();



print $q->header("application/json");
