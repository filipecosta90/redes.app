#!/usr/bin/perl 
use strict;
use warnings;

use Data::Dumper;
use JSON;
use CGI;
my $query = CGI->new;

my %data;
my %errors;

if ( defined( $query->param('ip_address') ) ) {
	my $ip_address = $query->param('ip_address');
}	
else {
	$errors{'ip_address'} = 'ipAddress is required.';
}

if ( defined( $query->param('snmp_key') ) ) {
	my $snmp_key = $query->param('snmp_key');
}	
else {
	$errors{'snmp_key'} = 'SNMP Key is required.';
}
if ( defined( $query->param('snmp_mib') ) ) {
	my @snmp_mib = $query->param('snmp_mib');
}	
else {
	$errors{'snmp_mib'} = 'SNMP MIB is required.';
}
if ( defined( $query->param('snmp_mib_time') ) ) {
	my $snmp_mib_time = $query->param('snmp_mib_time');
}	
else {
	$errors{'snmp_mib_time'} = 'SNMP MIB for time tracking is required.';
}

if ( %errors ) {
	$data{'success'} = 'false';
	$data{'errors'} = \%errors;
	$data{'messageError'} = 'Please check the fields in red';	
} 

my $response = encode_json( { %data } );

print $query->header("application/json");
print $response;
