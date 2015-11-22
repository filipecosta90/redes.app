#!/usr/bin/perl  
use strict;
use warnings;

use Data::Dumper;
use JSON;
use CGI qw(:standard);
use CGI::Carp 'fatalsToBrowser';
use Net::SNMP qw(:snmp);
use DB;

my $query = CGI->new;

my %data;
my %errors;

my $ip_address;
my $snmp_key;
my @snmp_oids;
my $session;
my $error;


my $sysUpTime = '1.3.6.1.2.1.1.3';

if ( defined( $query->param('ip_address') ) ) {
	$ip_address = $query->param('ip_address');
}
else {
	$errors{'ip_address'} = 'ipAddress is required.';
}

if ( defined( $query->param('snmp_key') ) ) {
	$snmp_key = $query->param('snmp_key');
}
else {
	$errors{'snmp_key'} = 'SNMP Key is required.';
}
if ( defined( $query->param('snmp_oids') ) ) {
	my $snmp_encoded = $query->param('snmp_oids');
	@snmp_oids = split /,/, $snmp_encoded;
}
else {
	$errors{'snmp_oids'} = 'At least one SNMP OID is required.';
}

if ( %errors ) {
	$data{'success'} = 'false';
	$data{'errors'} = \%errors;
	$data{'messageError'} = 'Please check the fields in red';
}
else {
	($session, $error) = Net::SNMP->session(
		-hostname => $ip_address,
		-version => 'snmpv2c',
		-community => $snmp_key,
		-translate   => [
			-timeticks => 0x0   # Turn off so sysUpTime is numeric
		]  
	);

	if (!defined $session) {
		$data{'success'} = 'false';
		$errors{'session'} = 'Unable to define Net::SNMP session.';
		$data{'errors'} = \%errors;
		$data{'messageError'} = 'Please check the fields in red';
	}
	else{
		$data{'success'} = 'true';		
		my @args;
		my @snmp_varbind;	
		push (@snmp_varbind , $sysUpTime);	
		foreach my $f ( @snmp_oids ) {
			push(@snmp_varbind, $f);
		}
		push (@args ,-nonrepeaters  => 1);
		push (@args, -varbindlist => \@snmp_varbind);
		push (@args, -maxrepetitions => 1  ); 

		$session->get_bulk_request(@args);
		my %oids = oid_lex_sort(keys(%{$session->var_bind_list()}));
		my $uptime = $session->var_bind_list->{"$sysUpTime.0"};
		$data{'snmp_time'} = $uptime;
		my %snmp_data;
		foreach (%oids) {
			my $oid_key = $_;
			my $response;
			my $string = $session->var_bind_list()->{$_};
			if ( $oid_key eq "$sysUpTime.0"){

			}
			else{
				push @{$snmp_data{$oid_key}}, $string;
			}
		}
		$data{'snmp_data'}=\%snmp_data;	
	}
}

print header('application/json');
my $json_response = encode_json( { %data } );
print $json_response;

