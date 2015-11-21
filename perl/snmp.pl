#!/usr/bin/perl  
use strict;
use warnings;

use Data::Dumper;
use JSON;
use CGI;
use CGI::Carp 'fatalsToBrowser';
use Net::SNMP qw(:snmp);
use DB;

my $query = CGI->new;

my %data;
my %errors;
my @response;

my $ip_address;
my $snmp_key;
my @snmp_oids =  ( '1.3.6.1.2.1.4.3' );
my $snmp_mib_time='1.3.6.1.2.1.1.3';

my $session;
my $error;

if ( defined( $query->param('ip_address') ) ) {
	$ip_address = $query->param('ip_address');
}
else {
	$ip_address = 'localhost';
#	$errors{'ip_address'} = 'ipAddress is required.';
}

if ( defined( $query->param('snmp_key') ) ) {
	$snmp_key = $query->param('snmp_key');
}
else {
#	$errors{'snmp_key'} = 'SNMP Key is required.';
	$snmp_key = 'public';
}
if ( defined( $query->param('snmp_oids') ) ) {
#	@snmp_oids = $query->param('snmp_oids');
}
else {
#	$errors{'snmp_oids'} = 'At least one SNMP OID is required.';
}
if ( defined( $query->param('snmp_mib_time') ) ) {
#	$snmp_mib_time = $query->param('snmp_mib_time');
}
else {
#	$errors{'snmp_mib_time'} = 'SNMP MIB for time tracking is required.';
}

if ( %errors ) {
	$data{'success'} = 'false';
	$data{'errors'} = \%errors;
	$data{'messageError'} = 'Please check the fields in red';
	my $json_response = encode_json( { %data } );
	print $query->header("application/json");
	print $json_response;

}

else {
	($session, $error) = Net::SNMP->session(
			-hostname => $ip_address,
			-version => 'snmpv2c',
			-community => $snmp_key
			);

	if (!defined $session) {
		$data{'success'} = 'false';
		$errors{'session'} = 'Unable to define Net::SNMP session.';
		$data{'errors'} = \%errors;
		$data{'messageError'} = 'Please check the fields in red';
		my $json_response = encode_json( { %data } );
		print $query->header("application/json");
		print $json_response;

	}
	else{
		my @args;
		my @snmp_varbind;	

		push (@snmp_varbind ,$snmp_mib_time);	
		push (@snmp_varbind , @snmp_oids);
		push (@args ,-nonrepeaters  => 1);
		push (@args, -varbindlist => \@snmp_varbind);
		push (@args, -maxrepetitions => 1  ); 

		$session->get_bulk_request(@args);

		my @oids = oid_lex_sort(keys(%{$session->var_bind_list()}));

		foreach (@oids) {
			printf(
					"%s = %s: %s\n", $_, 
					snmp_type_ntop($session->var_bind_types()->{$_}),
					$session->var_bind_list()->{$_},
			      );
		}
	}
}
