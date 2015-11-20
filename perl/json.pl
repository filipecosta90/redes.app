#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use JSON;
use Data::Dumper;

my $q = new CGI;
my $in = $q->Vars;
my $string = Dumper ($in);
my $response = encode_json( { calling_params => "$string" } );

print $q->header("application/json");
print $response;
